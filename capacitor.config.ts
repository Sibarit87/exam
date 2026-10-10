import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.yourapp.avto',
  appName: 'Экзамены',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;