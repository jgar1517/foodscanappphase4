import { Appsignal } from '@appsignal/javascript';

// Initialize AppSignal with your configuration
export const appsignal = new Appsignal({
  key: process.env.EXPO_PUBLIC_APPSIGNAL_API_KEY || 'YOUR_APPSIGNAL_API_KEY', // Replace with your actual API key
  name: process.env.EXPO_PUBLIC_APPSIGNAL_APP_NAME || 'Food Ingredient Safety Scanner',
  environment: process.env.EXPO_PUBLIC_APPSIGNAL_ENVIRONMENT || 'development',
  
  // React Native specific configuration
  enableBackgroundReporting: true,
  enableUnhandledPromiseRejection: true,
  
  // Optional: Configure what data to send
  sendError: true,
  sendPerformance: true,
  
  // Optional: Filter sensitive data
  filterParameters: ['password', 'token', 'secret'],
  
  // Optional: Ignore certain actions/routes
  ignoreActions: [
    // Add any routes/actions you want to ignore
  ],
});

export default appsignal;