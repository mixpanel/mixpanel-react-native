import uuid from "uuid";

describe("MixpanelPersistent", () => {
  const token = "testToken";
  let asyncStorageAdapterMock;
  let MixpanelPersistent;

  beforeEach(() => {
    jest.isolateModules(() => {
      jest.mock("uuid", () => ({
        v4: jest.fn(() => "uuid-v4-mock"),
      }));

      MixpanelPersistent = require("mixpanel-react-native/javascript/mixpanel-persistent")
        .MixpanelPersistent;
      const AsyncStorageAdapter = require("mixpanel-react-native/javascript/mixpanel-storage")
        .AsyncStorageAdapter;
      asyncStorageAdapterMock = new AsyncStorageAdapter();
      asyncStorageAdapterMock.getItem.mockResolvedValue(null);
      asyncStorageAdapterMock.setItem.mockResolvedValue(undefined);
      asyncStorageAdapterMock.removeItem.mockResolvedValue(undefined);
    });
  });

  it("loads and persists deviceId correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );
    await mixpanelPersistent.loadDeviceId(token);

    expect(uuid.v4).toHaveBeenCalled();
    mixpanelPersistent.updateDeviceId(token, "uuid-v4-mock");
    mixpanelPersistent.persistDeviceId(token);
    expect(asyncStorageAdapterMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      "uuid-v4-mock"
    );

    const deviceId = mixpanelPersistent.getDeviceId(token);
    expect(deviceId).toEqual("uuid-v4-mock");
  });

  it("loads and updates distinctId correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );

    await mixpanelPersistent.loadDeviceId(token);
    mixpanelPersistent.updateDeviceId(token, "device-id-mock");

    await mixpanelPersistent.loadDistinctId(token);
    const distinctId = mixpanelPersistent.getDistinctId(token);
    expect(distinctId).toEqual("$device:device-id-mock");

    mixpanelPersistent.updateDistinctId(token, "distinct-id-updated");
    await mixpanelPersistent.persistDistinctId(token);

    expect(asyncStorageAdapterMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      "distinct-id-updated"
    );
  });

  it("loads and persists userId correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );
    const userId = "user-id-mock";

    asyncStorageAdapterMock.getItem.mockResolvedValueOnce(userId);

    await mixpanelPersistent.loadUserId(token);
    expect(mixpanelPersistent.getUserId(token)).toEqual(userId);

    const newUserId = "new-user-id";
    mixpanelPersistent.updateUserId(token, newUserId);
    await mixpanelPersistent.persistUserId(token);

    expect(asyncStorageAdapterMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      newUserId
    );
  });

  it("loads, updates, and persists super properties correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );
    const superProperties = { prop1: "value1", prop2: "value2" };
    asyncStorageAdapterMock.getItem.mockResolvedValueOnce(
      JSON.stringify(superProperties)
    );

    await mixpanelPersistent.loadSuperProperties(token);

    expect(mixpanelPersistent.getSuperProperties(token)).toEqual(
      superProperties
    );

    const updatedSuperProperties = { ...superProperties, prop3: "value3" };
    mixpanelPersistent.updateSuperProperties(token, updatedSuperProperties);
    await mixpanelPersistent.persistSuperProperties(token);

    expect(asyncStorageAdapterMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(updatedSuperProperties)
    );
  });

  it("loads, updates, and persists time events correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );
    const timeEvents = { event1: Date.now() };

    asyncStorageAdapterMock.getItem.mockResolvedValueOnce(
      JSON.stringify(timeEvents)
    );

    await mixpanelPersistent.loadTimeEvents(token);

    expect(mixpanelPersistent.getTimeEvents(token)).toEqual(timeEvents);

    const updatedTimeEvents = { ...timeEvents, event2: Date.now() };
    mixpanelPersistent.updateTimeEvents(token, updatedTimeEvents);
    await mixpanelPersistent.persistTimeEvents(token);

    expect(asyncStorageAdapterMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(updatedTimeEvents)
    );
  });

  it("loads, updates, and persists opt-out status correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );

    asyncStorageAdapterMock.getItem.mockResolvedValueOnce("true");

    await mixpanelPersistent.loadOptOut(token);
    expect(mixpanelPersistent.getOptedOut(token)).toBe(true);

    mixpanelPersistent.updateOptedOut(token, false);
    await mixpanelPersistent.persistOptedOut(token);

    expect(asyncStorageAdapterMock.setItem).toHaveBeenCalledWith(
      expect.any(String),
      "false"
    );
  });

  it("resets identity and related data correctly", async () => {
    const mixpanelPersistent = MixpanelPersistent.getInstance(
      asyncStorageAdapterMock
    );

    await mixpanelPersistent.reset(token);
    expect(asyncStorageAdapterMock.removeItem).toHaveBeenCalledTimes(5);
  });
});
