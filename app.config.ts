import type { ExpoConfig } from "expo/config";

type AppEnv = "development" | "staging" | "production";

const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? "development") as AppEnv;

const envConfig: Record<
  AppEnv,
  {
    name: string;
    package: string;
    googleServicesFile: string;
    adaptiveIconBackgroundColor: string;
  }
> = {
  development: {
    name: "KPS (Dev)",
    package: "com.mercecii.schoolapp.dev",
    googleServicesFile: "./google-services.dev.json",
    adaptiveIconBackgroundColor: "#FCE4E4",
  },
  staging: {
    name: "KPS (Staging)",
    package: "com.mercecii.schoolapp.staging",
    googleServicesFile: "./google-services.staging.json",
    adaptiveIconBackgroundColor: "#FFF3D6",
  },
  production: {
    // Must match the app.json values this replaced, byte-for-byte —
    // this is the live Play Store identity, undisturbed by this migration.
    name: "KPS",
    package: "com.mercecii.schoolapp",
    googleServicesFile: "./google-services.prod.json",
    adaptiveIconBackgroundColor: "#E6F4FE",
  },
};

const env = envConfig[APP_ENV];

const config = (): ExpoConfig => ({
  name: env.name,
  slug: "school-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/school-logo.png",
  scheme: "school-app",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  androidStatusBar: {
    translucent: false,
    backgroundColor: "#ffffff",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: env.adaptiveIconBackgroundColor,
      foregroundImage: "./assets/images/school-logo.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.package,
    googleServicesFile: env.googleServicesFile,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/school-logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#E6F4FE",
        dark: {
          backgroundColor: "#E6F4FE",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "10c5a46a-0e7f-4427-8a11-69c484df6407",
    },
  },
});

export default config;
