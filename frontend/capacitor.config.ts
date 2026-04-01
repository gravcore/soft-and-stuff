import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gravcore.softandstuff',
  appName: 'Soft and Stuff',
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
