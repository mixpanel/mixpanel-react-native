import React from "react";
import {
  SectionList,
  Text,
  View,
  Button,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { Mixpanel } from "mixpanel-react-native";

const App = () => {
  const trackAutomaticEvents = false;
  const useNative = false;
  const mixpanel = new Mixpanel(
    "YOUR_MIXPANEL_TOKEN",
    trackAutomaticEvents,
    useNative
  );
  mixpanel.init();
  mixpanel.setLoggingEnabled(true);

  const group = mixpanel.getGroup("company_id", 111);
  const track = async () => {
    await mixpanel.track("Track Event1!");
  };

  const identify = async () => {
    await mixpanel.identify("testDistinctId");
  };

  const timeEvent = () => {
    const eventName = "Timed Event";
    mixpanel.timeEvent(eventName);
    setTimeout(async () => {
      await mixpanel.track(eventName);
    }, 2000);
  };

  const trackWProperties = async () => {
    const properties = { "Cool Property": "Property Value" };
    await mixpanel.track("Track event with property", properties);
  };

  /**
      registerSuperProperties will store a new superProperty and possibly overwriting any existing superProperty with the same name.
    */
  const registerSuperProperties = () => {
    mixpanel.registerSuperProperties({
      "super property": "super property value",
      "super property1": "super property value1",
    });
  };
  /**
      Erase all currently registered superProperties.
    */
  const clearSuperProperties = () => {
    mixpanel.clearSuperProperties();
  };

  const unregisterSuperProperty = () => {
    mixpanel.unregisterSuperProperty("super property");
  };
  /**
      Returns a json object of the user's current super properties.
    */
  const getSuperProperties = () => {
    mixpanel.getSuperProperties().then((t) => {
      alert(JSON.stringify(t));
    });
  };

  const registerSuperPropertiesOnce = () => {
    mixpanel.registerSuperPropertiesOnce({
      "super property": "super property value1",
    });
  };

  const flush = () => {
    mixpanel.flush();
  };

  const optIn = () => {
    mixpanel.optInTracking(mixpanel.getDistinctId());
  };

  const optOut = () => {
    mixpanel.optOutTracking();
  };

  const reset = () => {
    mixpanel.reset();
  };

  const setProperty = () => {
    mixpanel.getPeople().set({
      a: 1,
      b: 2.3,
      c: ["4", 5],
    });
  };

  const setOneProperty = () => {
    mixpanel.getPeople().set("d", "yo");
  };

  const setOnePropertyOnce = () => {
    mixpanel.getPeople().setOnce("c", "just once");
  };

  const unsetProperties = () => {
    mixpanel.getPeople().unset("a");
  };

  const incrementProperty = () => {
    mixpanel.getPeople().increment("a", 2.2);
  };

  const removePropertyValue = () => {
    mixpanel.getPeople().remove("c", 5);
  };

  const appendProperties = () => {
    mixpanel.getPeople().append("a", "Hello");
  };

  const unionProperties = () => {
    mixpanel.getPeople().union("a", ["goodbye", "hi"]);
  };

  const trackChargeWithoutProperties = () => {
    mixpanel.getPeople().trackCharge(22.8);
  };

  const trackCharge = () => {
    mixpanel.getPeople().trackCharge(12.8, { sandwich: 1 });
  };

  const clearCharges = () => {
    mixpanel.getPeople().clearCharges();
  };

  const deleteUser = () => {
    mixpanel.getPeople().deleteUser();
  };

  // -----------------  Group API -----------------
  const addGroup = () => {
    mixpanel.addGroup("company_id", 111);
  };

  const deleteGroup = () => {
    mixpanel.deleteGroup("company_id", 111);
  };

  const setGroup = () => {
    mixpanel.setGroup("company_id", 3233);
  };

  const removeGroup = () => {
    mixpanel.removeGroup("company_id", 3233);
  };

  const setGroupProperty = () => {
    group.set("prop_key", "prop_value1");
    group.set("prop_key1", ["prop_value11", "prop_value12"]);
  };

  const setGroupPropertyOnce = () => {
    group.setOnce("prop_key", "prop_value222");
  };

  const unsetGroupProperty = () => {
    group.unset("aaa");
  };

  const removeGroupProperty = () => {
    group.remove("prop_key1", "prop_value11");
  };

  const unionGroupProperty = () => {
    group.union("prop_key", ["prop_value_a", "prop_value_b"]);
  };

  const trackWithGroups = () => {
    mixpanel.trackWithGroups(
      "tracked with groups",
      { a: 1, b: 2.3 },
      { company_id: 111 }
    );
  };

  const DATA = [
    {
      title: "Events and Properties",
      data: [
        { id: "1", label: "Track Event", onPress: track },
        { id: "2", label: "Identify", onPress: identify },
        { id: "3", label: "Time Event for 2 secs", onPress: timeEvent },
        {
          id: "4",
          label: "Track Event with Properties",
          onPress: trackWProperties,
        },
        {
          id: "5",
          label: "Register Super Properties",
          onPress: registerSuperProperties,
        },
        {
          id: "6",
          label: "Clear Super Properties",
          onPress: clearSuperProperties,
        },
        {
          id: "7",
          label: "Unregister Super Property",
          onPress: unregisterSuperProperty,
        },
        {
          id: "8",
          label: "Get Super Properties",
          onPress: getSuperProperties,
        },
        {
          id: "9",
          label: "Register Super Properties Once",
          onPress: registerSuperPropertiesOnce,
        },
        { id: "10", label: "Flush", onPress: flush },
      ],
    },
    {
      title: "GDPR",
      data: [
        { id: "1", label: "Opt In", onPress: optIn },
        { id: "2", label: "Opt Out", onPress: optOut },
      ],
    },
    {
      title: "Profile",
      data: [
        { id: "2", label: "Set Property", onPress: setProperty },
        { id: "3", label: "Set One Property", onPress: setOneProperty },
        {
          id: "4",
          label: "Set One Property Once",
          onPress: setOnePropertyOnce,
        },
        { id: "5", label: "Unset Properties", onPress: unsetProperties },
        { id: "6", label: "Increment Property", onPress: incrementProperty },
        {
          id: "7",
          label: "Remove Property Value",
          onPress: removePropertyValue,
        },
        { id: "8", label: "Append Properties", onPress: appendProperties },
        { id: "9", label: "Union Properties", onPress: unionProperties },
        {
          id: "10",
          label: "Track Charge",
          onPress: trackChargeWithoutProperties,
        },
        {
          id: "11",
          label: "Track Charge with Properties",
          onPress: trackCharge,
        },
        { id: "12", label: "Clear Charges", onPress: clearCharges },
        { id: "1", label: "Reset", onPress: reset },
        { id: "13", label: "Delete User", onPress: deleteUser },
        { id: "14", label: "Flush", onPress: flush },
      ],
    },
    {
      title: "Group",
      data: [
        { id: "1", label: "Add Group", onPress: addGroup },
        { id: "2", label: "Set Group", onPress: setGroup },
        { id: "3", label: "Remove Group", onPress: removeGroup },
        { id: "4", label: "Delete Group", onPress: deleteGroup },
        { id: "5", label: "Track With Groups", onPress: trackWithGroups },
        { id: "6", label: "Set Group Property", onPress: setGroupProperty },
        { id: "7", label: "Set Property Once", onPress: setGroupPropertyOnce },
        { id: "8", label: "Unset Property", onPress: unsetGroupProperty },
        { id: "9", label: "Remove Property", onPress: removeGroupProperty },
        { id: "10", label: "Union Property", onPress: unionGroupProperty },
        { id: "11", label: "Flush", onPress: flush },
      ],
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Button title={item.label} onPress={item.onPress} color="#8A2BE2" />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.header}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  item: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
});

export default App;
