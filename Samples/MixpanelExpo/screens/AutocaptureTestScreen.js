import React, {useState} from 'react';
import {
  Platform,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Switch,
  TextInput,
  StyleSheet,
} from 'react-native';

export function AutocaptureTestScreen() {
  const [tapCount, setTapCount] = useState(0);
  const [switchValue, setSwitchValue] = useState(false);
  const [textValue, setTextValue] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Autocapture Test Screen</Text>
      <Text style={styles.subtitle}>
        Run on both iOS and Android. Inspect Mixpanel event stream to verify.
      </Text>

      {/* ============================================================
          $el_id Resolution

          What each native SDK does with the props below.

          Android — View path (this is the path React Native uses):
            1. nativeID           — RN stores the prop as a view tag
            2. Resource entry name — getResourceEntryName(view.getId());
               RN's ids are generated at runtime and have no entry name,
               so testID never resolves here
            3. <SimpleClassName>_<hash>

          iOS — one path for UIKit and SwiftUI:
            1. nativeID            — RN exposes it as an ObjC property
            2. accessibilityIdentifier — RN: testID
            3. <ClassName>_<hash>

          accessibilityLabel is NOT used, on either platform. It is
          localized — the same element would report a different id per
          language — and it can carry user data. It is not reported as a
          property either: there is no $attr-aria-label.

          The hash is not random: it is derived from the element's position
          in the hierarchy, so it stays the same across launches for the
          same layout. It identifies a position, not a row — reordering
          siblings changes it.

          The one prop that behaves identically on both platforms is
          nativeID. testID diverges: stable $el_id on iOS, hash on Android.

          NOTE: in a React Native *debug* build every tap resolves to RN's
          full-screen DebuggingOverlay, so none of these are observable —
          verify against a release build.
          ============================================================ */}
      <SectionHeader title="$el_id Resolution" />

      {/* Case 1: nativeID only — priority 1 on both platforms.
          `id` is React Native's modern alias: the JS layer copies it onto
          nativeID (react-native/Libraries/Components/View/View.js), and unlike
          `nativeID` it is typed on Touchable components. */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        id="rn_native_id_btn">
        <Text>nativeID only</Text>
        <Expect ios="rn_native_id_btn" android="rn_native_id_btn" />
      </TouchableOpacity>

      {/* Case 2: nativeID beats everything else, on both platforms. */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        id="rn_wins_btn"
        testID="tid_ignored_btn"
        accessible={true}
        accessibilityLabel="al_ignored_btn">
        <Text>nativeID + testID + accessibilityLabel</Text>
        <Expect ios="rn_wins_btn" android="rn_wins_btn" />
      </TouchableOpacity>

      {/* Case 3: testID only — the platform divergence.
          iOS maps testID to accessibilityIdentifier (priority 2); on Android
          RN's runtime-generated id has no resource entry name, so the SDK
          falls through to the structural hash. */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        accessible={false}
        testID="tid_only_btn">
        <Text>testID only</Text>
        <Expect ios="tid_only_btn" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* Case 4: testID + accessibilityLabel. The label is never a source, so
          iOS uses the identifier and Android — which cannot resolve RN's id —
          falls to the hash. */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        accessible={true}
        testID="tid_beats_label_btn"
        accessibilityLabel="al_never_used">
        <Text>testID + accessibilityLabel</Text>
        <Expect ios="tid_beats_label_btn" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* Case 5: accessibilityLabel only — never used as identity, on either
          platform, and never reported as a property. */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        accessible={true}
        accessibilityLabel="al_only_btn">
        <Text>accessibilityLabel only (never used)</Text>
        <Expect ios="<ClassName>_<hash>" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* Case 6: a label holding user data. Nothing about it reaches the
          payload — not $el_id, and there is no $attr-aria-label at all. */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        accessible={true}
        accessibilityLabel="Account ending 4321">
        <Text>label with user data (PII guard)</Text>
        <Expect ios="<ClassName>_<hash>" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* Case 7: no explicit label, only child text. Frameworks auto-derive a
          container label from it; that must not surface either. */}
      <TouchableOpacity style={styles.btn} onPress={() => {}} accessible={false}>
        <Text>auto-derived label from child text — 4111 1111 1111 1234</Text>
        <Expect ios="<ClassName>_<hash>" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* Case 8: nothing to identify the element — structural hash. Tap it
          twice across app launches: the id should be the same both times. */}
      <TouchableOpacity style={styles.btn} onPress={() => {}} accessible={false}>
        <Text>No nativeID, no testID, no label</Text>
        <Expect ios="<ClassName>_<hash>" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* Case 9: Pressable carrying a nativeID — same result as
          TouchableOpacity; resolution is per-view, not per-component. */}
      <Pressable style={styles.btn} onPress={() => {}} id="pressable_native_id">
        <Text>Pressable + nativeID</Text>
        <Expect ios="pressable_native_id" android="pressable_native_id" />
      </Pressable>

      {/* Case 10: label on a non-interactive child, nothing on the parent.
          Both SDKs walk up to the nearest clickable ancestor and resolve from
          there, so identity comes from the parent — which here has none. */}
      <TouchableOpacity style={styles.btn} onPress={() => {}}>
        <Text accessible={true} accessibilityLabel="child_text_al">
          Label on child Text (not on the parent)
        </Text>
        <Expect ios="<ClassName>_<hash>" android="ReactViewGroup_<hash>" />
      </TouchableOpacity>

      {/* ============================================================
          Click
          ============================================================ */}
      <SectionHeader title="Click" />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        accessible={true}
        accessibilityLabel="click_btn">
        <Text>Click Button - tap once → $mp_click</Text>
      </TouchableOpacity>

      {/* ============================================================
          Dead Click
          ============================================================ */}
      <SectionHeader title="Dead Click" />

      <View
        style={[styles.btn, styles.deadBtn]}
        accessible={true}
        accessibilityLabel="dead_rn_btn"
        accessibilityRole="button">
        <Text>Dead Button (no onPress) → $mp_dead_click</Text>
      </View>

      {/* ============================================================
          Rage Click - tap 4+ times rapidly
          ============================================================ */}
      <SectionHeader title="Rage Click - tap 4+ times rapidly" />

      <View
        style={[styles.btn, styles.rageZone]}
        accessible={true}
        accessibilityLabel="rage_zone"
        accessibilityRole="button">
        <Text>Rage Zone - tap rapidly (no state change)</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => setTapCount(c => c + 1)}
        accessible={true}
        accessibilityLabel="rage_and_click_btn">
        <Text>
          Click + Rage - tap 4x (both events): {tapCount}x
        </Text>
      </TouchableOpacity>

      {/* ============================================================
          Excluded Controls (no dead click)
          ============================================================ */}
      <SectionHeader title="Excluded Controls (no dead click)" />

      <View style={styles.row}>
        <Text style={styles.label}>Switch</Text>
        <Switch value={switchValue} onValueChange={setSwitchValue} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="TextInput - no dead click"
        value={textValue}
        onChangeText={setTextValue}
        accessibilityLabel="text_input"
      />
    </ScrollView>
  );
}

/**
 * Renders the $el_id each platform is expected to report for the case above it,
 * highlighting whichever platform the app is currently running on. Keeps the
 * expectations next to the props that produce them, so a mismatch in the event
 * stream is obvious without cross-referencing the SDK source.
 */
function Expect({ios, android}) {
  const isIOS = Platform.OS === 'ios';
  return (
    <Text style={styles.expect}>
      <Text style={isIOS ? styles.expectActive : undefined}>iOS: {ios}</Text>
      {'  ·  '}
      <Text style={isIOS ? undefined : styles.expectActive}>
        Android: {android}
      </Text>
    </Text>
  );
}

function SectionHeader({title}) {
  return (
    <View style={styles.sectionDivider}>
      <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 40},
  title: {fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4},
  subtitle: {fontSize: 13, color: '#8E8E93', marginBottom: 12},
  btn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadBtn: {borderColor: '#999', backgroundColor: 'rgba(0,0,0,0.03)'},
  expect: {fontSize: 11, color: '#8E8E93', marginTop: 4, textAlign: 'center'},
  expectActive: {color: '#007AFF', fontWeight: '600'},
  rageZone: {
    height: 80,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,0,0,0.08)',
    borderColor: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  label: {fontSize: 16, color: '#333'},
  sectionDivider: {
    marginTop: 16,
    marginBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C7C7CC',
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
});
