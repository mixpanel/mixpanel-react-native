import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

/**
 * Walk-Up-to-Clickable-Parent Test Screen
 *
 * Validates that when a non-interactive leaf view (Text, Image) is tapped,
 * the native SDK walks up to the nearest clickable ancestor (Pressable,
 * TouchableOpacity) for $el_id resolution.
 *
 * Two props matter, and each does a different job:
 *
 *   id                 supplies the identity. It becomes the view's nativeID, which both
 *                      SDKs read first. `accessibilityLabel` is NEVER used as identity on
 *                      either platform — it is localized and can carry user data — so a
 *                      wrapper carrying only a label reports a structural hash.
 *
 *   accessibilityRole  makes the wrapper discoverable on iOS. React Native dispatches
 *                      touches from a single recognizer on the surface root, so a
 *                      Pressable has no UIControl, no gesture recognizer and no trait of
 *                      its own; without the role the walk-up finds nothing and the tap
 *                      resolves to the <Text>. Android needs neither, because React
 *                      Native sets `focusable` there.
 *
 * Run on both iOS and Android, on a release build. Inspect the Mixpanel event stream.
 */
export function WalkUpTestScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Walk-Up Test Screen</Text>
      <Text style={styles.subtitle}>
        Tests that tapping a leaf view (Text/Image) inside a clickable wrapper
        reports the wrapper's id as $el_id, not the leaf's hash.
      </Text>

      {/* 1. Basic Walk-Up */}
      <SectionHeader title="Basic Walk-Up" />
      <Text style={styles.description}>
        Tap the text. $el_id should be "add_to_cart" from the Pressable.
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() => {}}
        id="add_to_cart"
        accessibilityRole="button">
        <Text style={styles.btnText}>Add to Cart</Text>
      </Pressable>

      {/* 2. Nested Pressables */}
      <SectionHeader title="Nested Pressables" />
      <Text style={styles.description}>
        Tap "Delete". Walk-up stops at inner Pressable ("delete_item"), not
        outer card ("product_card").
      </Text>
      <Pressable
        style={styles.card}
        onPress={() => {}}
        id="product_card"
        accessibilityRole="button">
        <Text style={styles.cardTitle}>Product Name</Text>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => {}}
          id="delete_item"
          accessibilityRole="button">
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </Pressable>

      {/* 3. Pressable with Image + Text */}
      <SectionHeader title="Clickable Container with Icon + Text" />
      <Text style={styles.description}>
        Tap the icon or text. $el_id should be "checkout_action".
      </Text>
      <Pressable
        style={styles.row}
        onPress={() => {}}
        id="checkout_action"
        accessibilityRole="button">
        <Text style={styles.icon}>🛒</Text>
        <Text style={styles.rowText}>Proceed to Checkout</Text>
      </Pressable>

      {/* 4. Non-interactive text */}
      <SectionHeader title="No Clickable Ancestor" />
      <Text style={styles.description}>
        Tap below. No Pressable ancestor exists. $el_id = hash fallback.
      </Text>
      <View style={styles.plainTextContainer}>
        <Text style={styles.plainText}>Terms and Conditions apply.</Text>
      </View>

      {/* 5. Leaf with own identity */}
      <SectionHeader title="Leaf Has Own Identity" />
      <Text style={styles.description}>
        Tap the text. Even though it has its own id ("inner_label"), walk-up
        still activates and takes the clickable parent's identity.
        $el_id = "outer_button".
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() => {}}
        id="outer_button"
        accessibilityRole="button">
        <Text style={styles.btnText} id="inner_label">
          I have my own identity
        </Text>
      </Pressable>

      {/* 6. View flattening */}
      <SectionHeader title="View Flattening" />
      <Text style={styles.description}>
        Intermediate View has no visual props and will be flattened away. Tap the
        text — walk-up should still find "flattened_pressable".
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() => {}}
        id="flattened_pressable"
        accessibilityRole="button">
        <View>
          <Text style={styles.btnText}>Text inside flattened View</Text>
        </View>
      </Pressable>

      {/* 7. TouchableOpacity variant */}
      <SectionHeader title="TouchableOpacity Variant" />
      <Text style={styles.description}>
        Same as basic walk-up but with TouchableOpacity. $el_id should be
        "touchable_btn".
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {}}
        id="touchable_btn"
        accessibilityRole="button">
        <Text style={styles.btnText}>TouchableOpacity Button</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionHeader({title}: {title: string}) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  btn: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
  },
  plainTextContainer: {
    padding: 8,
    marginBottom: 8,
  },
  plainText: {
    fontSize: 14,
    color: '#888',
  },
});
