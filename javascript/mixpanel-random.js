import { NativeModules } from "react-native";

let warnedInsecure = false;

/**
 * Fills bytes from the best source that doesn't need a native call: Web Crypto
 * (browsers, or an app that installed a crypto polyfill), then Expo's crypto
 * module (Expo Go, or apps with expo-crypto), then Math.random.
 * Returns false when it had to use Math.random.
 */
function fillRandomBytes(bytes) {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.getRandomValues === "function") {
    webCrypto.getRandomValues(bytes);
    return true;
  }

  const expoCrypto = globalThis.expo?.modules?.ExpoCrypto;
  if (expoCrypto && typeof expoCrypto.getRandomValues === "function") {
    expoCrypto.getRandomValues(bytes);
    return true;
  }

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return false;
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function formatUUIDv4(bytes) {
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Returns a random hex string of byteLength bytes. Synchronous and best effort:
 * it may fall back to Math.random, so use it only for IDs that needn't be
 * unpredictable, like trace IDs.
 */
export function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  fillRandomBytes(bytes);
  return toHex(bytes);
}

/**
 * Returns a lowercase UUID v4. When neither Web Crypto nor Expo's crypto module
 * is available, it asks this SDK's native module, which exists when the app was
 * built with it but runs in JavaScript mode. Math.random is the last resort, and
 * warns once regardless of setLoggingEnabled.
 */
export async function randomUUID() {
  const bytes = new Uint8Array(16);
  if (fillRandomBytes(bytes)) {
    return formatUUIDv4(bytes);
  }

  const nativeModule = NativeModules.MixpanelReactNative;
  if (nativeModule && typeof nativeModule.randomUUID === "function") {
    try {
      return (await nativeModule.randomUUID()).toLowerCase();
    } catch (e) {
      // Fall through to Math.random
    }
  }

  if (!warnedInsecure) {
    warnedInsecure = true;
    console.warn(
      "[Mixpanel] No secure random source found; generating IDs with Math.random."
    );
  }
  return formatUUIDv4(bytes);
}
