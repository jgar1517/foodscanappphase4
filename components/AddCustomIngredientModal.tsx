import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import UserProfileService from '@/services/userProfileService';

interface AddCustomIngredientModalProps {
  visible: boolean;
  onClose: () => void;
  onIngredientAdded: () => void;
}

export default function AddCustomIngredientModal({
  visible,
  onClose,
  onIngredientAdded,
}: AddCustomIngredientModalProps) {
  const [ingredientName, setIngredientName] = useState('');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = async () => {
    if (!ingredientName.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason for avoiding this ingredient');
      return;
    }

    setLoading(true);
    try {
      await UserProfileService.addCustomAvoidance(
        ingredientName.trim(),
        reason.trim(),
        severity
      );

      // Reset form
      setIngredientName('');
      setReason('');
      setSeverity('moderate');

      onIngredientAdded();
      onClose();

      Alert.alert('Success', 'Custom ingredient added successfully');
    } catch (error) {
      console.error('Failed to add custom ingredient:', error);
      Alert.alert('Error', 'Failed to add custom ingredient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIngredientName('');
    setReason('');
    setSeverity('moderate');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Custom Ingredient</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingredient Name *</Text>
            <TextInput
              style={styles.input}
              value={ingredientName}
              onChangeText={setIngredientName}
              placeholder="e.g., Red Dye #40, Aspartame"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason for Avoiding *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., Causes allergic reactions, Personal preference"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Severity Level</Text>
            <View style={styles.severityContainer}>
              {(['mild', 'moderate', 'severe'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    severity === level && styles.severityButtonActive,
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text
                    style={[
                      styles.severityButtonText,
                      severity === level && styles.severityButtonTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.severityDescription}>
              {severity === 'mild' && 'Minor concern - will show as caution'}
              {severity === 'moderate' && 'Moderate concern - will show as caution'}
              {severity === 'severe' && 'Major concern - will show as avoid'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddIngredient}
            disabled={loading}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add Ingredient'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  severityButtonTextActive: {
    color: '#ffffff',
  },
  severityDescription: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});