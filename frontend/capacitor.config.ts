import type { CapacitorConfig } from '@capacitor/cli';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), 'VITE_');

const config: CapacitorConfig = {
  appId: env.VITE_APP_ID,
  appName: env.VITE_BRAND_TITLE,
  webDir: 'dist',
  server: {
    // url: 'http://192.168.56.1:5173', // used for hot reload in development
    cleartext: true, // Allows HTTP (required for Android to load non-HTTPS dev servers)
    androidScheme: 'https' // required for cookies and localStorage to work on Android
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT', // DEFAULT = follows the OS dark/light mode automatically. icon color adjusts with system theme
      backgroundColor: '#00000000',
      overlaysWebView: true, // overlaysWebView = app content extends behind the status bar. required for edge to edge
    },
  },
};

export default config;
