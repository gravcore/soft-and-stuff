import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gravcore.softandstuff',
  appName: 'Soft and Stuff',
  webDir: 'dist',
  server: { androidScheme: 'https' } // required for cookies and localStorage to work on Android
};

export default config;
