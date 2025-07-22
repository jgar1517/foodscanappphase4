import OCRService, { ProcessedIngredients } from './ocrService';
import IngredientService, { AnalysisResult } from './ingredientService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanSession {
  id: string;
  imageUri: string;
  thumbnailUri?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  ocrResult?: ProcessedIngredients;
  analysisResult?: AnalysisResult;
  errorMessage?: string;
}

export interface ScanResult {
  session: ScanSession;
  ingredients: AnalysisResult;
  processingTime: number;
}

class ScanService {
  private static instance: ScanService;
  private readonly STORAGE_KEY = 'scan_history';

  public static getInstance(): ScanService {
    if (!ScanService.instance) {
      ScanService.instance = new ScanService();
    }
    return ScanService.instance;
  }

  /**
   * Process a complete scan from image to analysis
   */
  async processScan(imageUri: string): Promise<ScanResult> {
    const startTime = Date.now();
    
    // Create scan session
    const session: ScanSession = {
      id: this.generateSessionId(),
      imageUri,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Save initial session
      await this.saveScanSession(session);

      // Step 1: Extract text from image
      console.log('Starting OCR processing...');
      const ocrResult = await OCRService.extractTextFromImage(imageUri);
      const processedIngredients = await OCRService.processIngredientsFromText(ocrResult);
      
      session.ocrResult = processedIngredients;
      session.updatedAt = new Date();
      await this.saveScanSession(session);

      // Step 2: Analyze ingredients for safety
      console.log('Starting ingredient analysis...');
      const analysisResult = await IngredientService.analyzeIngredients(processedIngredients.ingredients);
      
      session.analysisResult = analysisResult;
      session.status = 'completed';
      session.updatedAt = new Date();
      await this.saveScanSession(session);

      const totalProcessingTime = Date.now() - startTime;

      console.log(`Scan completed in ${totalProcessingTime}ms`);
      console.log(`Found ${processedIngredients.ingredients.length} ingredients`);
      console.log(`Safety score: ${analysisResult.overallSafetyScore}/100`);

      return {
        session,
        ingredients: analysisResult,
        processingTime: totalProcessingTime
      };

    } catch (error) {
      console.error('Scan processing failed:', error);
      
      session.status = 'failed';
      session.errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      session.updatedAt = new Date();
      await this.saveScanSession(session);

      throw error;
    }
  }

  /**
   * Get scan session by ID
   */
  async getScanSession(sessionId: string): Promise<ScanSession | null> {
    try {
      const history = await this.getScanHistory();
      return history.find(session => session.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to get scan session:', error);
      return null;
    }
  }

  /**
   * Get scan history
   */
  async getScanHistory(): Promise<ScanSession[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!historyJson) return [];

      const history = JSON.parse(historyJson);
      
      // Convert date strings back to Date objects
      return history.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load scan history:', error);
      return [];
    }
  }

  /**
   * Save scan session to storage
   */
  private async saveScanSession(session: ScanSession): Promise<void> {
    try {
      const history = await this.getScanHistory();
      const existingIndex = history.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        history[existingIndex] = session;
      } else {
        history.unshift(session); // Add to beginning
      }

      // Keep only last 50 scans
      const trimmedHistory = history.slice(0, 50);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save scan session:', error);
      throw error;
    }
  }

  /**
   * Delete scan session
   */
  async deleteScanSession(sessionId: string): Promise<void> {
    try {
      const history = await this.getScanHistory();
      const filteredHistory = history.filter(session => session.id !== sessionId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to delete scan session:', error);
      throw error;
    }
  }

  /**
   * Clear all scan history
   */
  async clearScanHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear scan history:', error);
      throw error;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get scan statistics
   */
  async getScanStatistics(): Promise<{
    totalScans: number;
    completedScans: number;
    failedScans: number;
    averageSafetyScore: number;
    lastScanDate?: Date;
  }> {
    try {
      const history = await this.getScanHistory();
      const completedScans = history.filter(s => s.status === 'completed');
      const failedScans = history.filter(s => s.status === 'failed');
      
      const averageSafetyScore = completedScans.length > 0
        ? completedScans.reduce((sum, scan) => sum + (scan.analysisResult?.overallSafetyScore || 0), 0) / completedScans.length
        : 0;

      return {
        totalScans: history.length,
        completedScans: completedScans.length,
        failedScans: failedScans.length,
        averageSafetyScore: Math.round(averageSafetyScore),
        lastScanDate: history.length > 0 ? history[0].createdAt : undefined
      };
    } catch (error) {
      console.error('Failed to get scan statistics:', error);
      return {
        totalScans: 0,
        completedScans: 0,
        failedScans: 0,
        averageSafetyScore: 0
      };
    }
  }
}

export default ScanService.getInstance();