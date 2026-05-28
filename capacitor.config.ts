import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ourstory.pixelhearts",
  appName: "Pixel Hearts",
  webDir: ".next",
  server: {
    url: "https://our-story-game.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#111524",
  },
};

export default config;
