import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, FlipHorizontal, Image as ImageIcon, Zap, X, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ScanService from '@/services/scanService';
import OCRService from '@/services/ocrService';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permissions are loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={80} color="#10b981" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            We need access to your camera to scan ingredient labels and provide safety analysis.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const processPicture = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    
    try {
      // Validate image quality first
      console.log('Validating image quality...');
      const qualityCheck = await OCRService.validateImageQuality(capturedImage);
      
      if (!qualityCheck.isValid) {
        Alert.alert(
          'Image Quality Warning',
          `${qualityCheck.issues.join(', ')}. ${qualityCheck.suggestions.join(' ')} Would you like to continue anyway?`,
          [
            { text: 'Retake Photo', onPress: () => setIsProcessing(false) },
            { text: 'Continue', onPress: () => processScanWithImage() }
          ]
        );
        return;
      }
      
      await processScanWithImage();
    } catch (error) {
      console.error('Image processing failed:', error);
      setIsProcessing(false);
      Alert.alert(
        'Processing Failed', 
        'We couldn\'t process your image. Please try again with better lighting or a clearer photo.',
        [{ text: 'OK' }]
      );
    }
  };

  const processScanWithImage = async () => {
    try {
      // Process the scan using our OCR and ingredient analysis services
      console.log('Starting scan processing...');
      const result = await ScanService.processScan(capturedImage);
      
      console.log('Scan completed:', result);
      
      // Navigate to results with the scan session ID
      setIsProcessing(false);
      setCapturedImage(null);
      router.push(`/results?sessionId=${result.session.id}`);
    } catch (error) {
      console.error('Scan processing failed:', error);
      setIsProcessing(false);
      Alert.alert(
        'Processing Failed', 
        'We couldn\'t process your image. Please try again with better lighting or a clearer photo.',
        [{ text: 'OK' }]
      );
    }
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.previewOverlay}>
            <TouchableOpacity 
              style={styles.retakeButton}
              onPress={retakePicture}
            >
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={retakePicture}
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
              onPress={processPicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Zap size={20} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <CheckCircle size={20} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Analyze Ingredients</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#201A40', '#302860']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Ingredient Label</Text>
          <Text style={styles.headerSubtitle}>
            Position the ingredient label within the frame for best results
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              
              <View style={styles.scanInstruction}>
                <Text style={styles.scanInstructionText}>
                  Align ingredient label within the frame
                </Text>
              </View>
            </View>
          </CameraView>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={pickImage}
          >
            <ImageIcon size={24} color="#10b981" />
            <Text style={styles.controlButtonText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleCameraFacing}
          >
            <FlipHorizontal size={24} color="#10b981" />
            <Text style={styles.controlButtonText}>Flip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for Better Results:</Text>
          <Text style={styles.tipsText}>
            • Ensure good lighting and clear focus{'\n'}
            • Keep the label flat and avoid shadows{'\n'}
            • Make sure all text is visible in the frame
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width - 80,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10b981',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanInstruction: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanInstructionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#10b981',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
  },
  tips: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  retakeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});