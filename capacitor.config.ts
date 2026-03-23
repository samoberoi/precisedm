import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7ff78999af584443a8841d10f3c1d73f',
  appName: 'PreciseDM',
  webDir: 'dist',
  server: {
    url: 'https://7ff78999-af58-4443-a884-1d10f3c1d73f.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
    },
  },
};

export default config;
