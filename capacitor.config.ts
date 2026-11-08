import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amanora.app',
  appName: 'Amanora',
  webDir: 'dist',
  server: {
    url: 'https://amanora-prayer.vercel.app',
    cleartext: false
  }
};

export default config;
