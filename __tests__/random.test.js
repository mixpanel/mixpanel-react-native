// Test the random sources behind device IDs and traceparent headers
describe("mixpanel-random", () => {
  const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const realCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");

  // Hides Web Crypto and Expo's crypto module, and sets the native module (or none)
  function loadWithSources({ webCrypto, expoCrypto, nativeModule } = {}) {
    Object.defineProperty(globalThis, "crypto", {
      value: webCrypto,
      configurable: true,
      writable: true,
    });
    globalThis.expo = expoCrypto ? { modules: { ExpoCrypto: expoCrypto } } : undefined;
    jest.doMock("react-native", () => ({
      NativeModules: nativeModule ? { MixpanelReactNative: nativeModule } : {},
    }));
    return require("mixpanel-react-native/javascript/mixpanel-random");
  }

  function fillWith(value) {
    return jest.fn((bytes) => bytes.fill(value));
  }

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (realCrypto) {
      Object.defineProperty(globalThis, "crypto", realCrypto);
    } else {
      delete globalThis.crypto;
    }
    delete globalThis.expo;
  });

  it("uses Web Crypto when the app has it", async () => {
    const getRandomValues = fillWith(0xff);
    const { randomUUID } = loadWithSources({ webCrypto: { getRandomValues } });

    const uuid = await randomUUID();

    expect(getRandomValues).toHaveBeenCalled();
    // Version and variant bits are set on top of the random bytes
    expect(uuid).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
  });

  it("uses Expo's crypto module when there is no Web Crypto", async () => {
    const getRandomValues = fillWith(0x00);
    const nativeModule = { randomUUID: jest.fn() };
    const { randomUUID } = loadWithSources({ expoCrypto: { getRandomValues }, nativeModule });

    const uuid = await randomUUID();

    expect(getRandomValues).toHaveBeenCalled();
    expect(nativeModule.randomUUID).not.toHaveBeenCalled();
    expect(uuid).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("asks the native module when there is no JavaScript crypto source", async () => {
    const nativeModule = {
      randomUUID: jest.fn().mockResolvedValue("6BA7B810-9DAD-41D1-80B4-00C04FD430C8"),
    };
    const { randomUUID } = loadWithSources({ nativeModule });

    const uuid = await randomUUID();

    expect(nativeModule.randomUUID).toHaveBeenCalled();
    expect(uuid).toBe("6ba7b810-9dad-41d1-80b4-00c04fd430c8");
  });

  it("skips a JavaScript crypto source that throws", async () => {
    // react-native-get-random-values throws like this when its native module isn't linked
    const throwing = jest.fn(() => {
      throw new Error("Native module not found");
    });
    const nativeModule = {
      randomUUID: jest.fn().mockResolvedValue("6ba7b810-9dad-41d1-80b4-00c04fd430c8"),
    };
    const { randomUUID, randomHex } = loadWithSources({
      webCrypto: { getRandomValues: throwing },
      nativeModule,
    });

    expect(await randomUUID()).toBe("6ba7b810-9dad-41d1-80b4-00c04fd430c8");
    expect(throwing).toHaveBeenCalled();
    expect(randomHex(8)).toMatch(/^[0-9a-f]{16}$/);
  });

  it("uses Expo's crypto module when Web Crypto throws", async () => {
    const getRandomValues = fillWith(0x00);
    const { randomUUID } = loadWithSources({
      webCrypto: {
        getRandomValues: () => {
          throw new Error("Native module not found");
        },
      },
      expoCrypto: { getRandomValues },
    });

    expect(await randomUUID()).toBe("00000000-0000-4000-8000-000000000000");
    expect(getRandomValues).toHaveBeenCalled();
  });

  it("falls back to Math.random when no other source works, warning once", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const nativeModule = { randomUUID: jest.fn().mockRejectedValue(new Error("unavailable")) };
    const { randomUUID } = loadWithSources({ nativeModule });

    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      const uuid = await randomUUID();
      expect(uuid).toMatch(UUID_V4);
      uuids.add(uuid);
    }
    expect(uuids.size).toBe(100);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Math.random"));
  });

  it("returns random hex of the requested length for trace IDs", () => {
    const { randomHex } = loadWithSources();

    expect(randomHex(16)).toMatch(/^[0-9a-f]{32}$/);
    expect(randomHex(8)).toMatch(/^[0-9a-f]{16}$/);
  });
});
