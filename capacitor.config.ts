import type { CapacitorConfig } from '@capacitor/cli';

const appUrl = process.env.CAPACITOR_APP_URL;

const config: CapacitorConfig = {
  appId: 'com.smartyt.app',
  appName: 'Smartyt',
  webDir: 'public',
  ...(appUrl ? { server: { url: appUrl, cleartext: false } } : {}),
};

export default config;