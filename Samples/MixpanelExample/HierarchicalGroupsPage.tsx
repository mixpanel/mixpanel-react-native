import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Mixpanel, MixpanelGroup} from 'mixpanel-react-native';

// Hierarchical groups is an init-time option, so this page uses its own project and instance
// rather than the one App initializes.
const HG_PROJECT_TOKEN = 'YOUR_HG_PROJECT_TOKEN';

// Filter the Metro / device log on "HGDemo" to see which button each request belongs to.
const LOG_PREFIX = '[HGDemo]';

// No automatic events, so each flush sends only what the button's call queued
const trackAutomaticEvents = false;
let hgMixpanel: Promise<Mixpanel> | null = null;

function getHierarchicalGroupsMixpanel(): Promise<Mixpanel> {
  if (!hgMixpanel) {
    const mixpanel = new Mixpanel(HG_PROJECT_TOKEN, trackAutomaticEvents);
    hgMixpanel = mixpanel
      .init(
        false,
        {},
        undefined,
        undefined,
        undefined,
        undefined,
        true, // hierarchicalGroups
      )
      .then(() => {
        mixpanel.setLoggingEnabled(true);
        return mixpanel;
      })
      .catch(error => {
        hgMixpanel = null;
        throw error;
      });
  }
  return hgMixpanel;
}

// MixpanelGroup.set also takes an object of properties
type GroupWithSetMap = {set(properties: {[key: string]: unknown}): void};

type Action = {title: string; run: () => unknown};
type Section = {title: string; actions: Action[]};

type Props = {
  onBack: () => void;
};

function HierarchicalGroupsPage({onBack}: Props): React.JSX.Element {
  const [mixpanel, setMixpanel] = useState<Mixpanel | null>(null);
  const [userId, setUserId] = useState('tyler_rn');
  const [companyId, setCompanyId] = useState('violet_tiger');
  const [teamId, setTeamId] = useState('rn_team');

  useEffect(() => {
    getHierarchicalGroupsMixpanel()
      .then(setMixpanel)
      .catch(error => {
        console.error(`${LOG_PREFIX} Failed to initialize Mixpanel:`, error);
      });
  }, []);

  if (!mixpanel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hierarchical Groups</Text>
          <Text style={styles.statusText}>Initializing Mixpanel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // The same group profile operations, for the company and for the custom team_id group
  const groupActions = (
    label: string,
    groupKey: string,
    // getCompany() resolves to null when there is no company to update
    group: () => MixpanelGroup | Promise<MixpanelGroup | null>,
    groupId: () => string | Promise<string | null>,
  ): Action[] => [
    {
      title: `${label}: Set Property`,
      run: async () => (await group())?.set('tier', 'enterprise'),
    },
    {
      title: `${label}: Set Properties (Map)`,
      run: async () =>
        ((await group()) as unknown as GroupWithSetMap | null)?.set({
          size: 12,
          region: 'us',
        }),
    },
    {
      title: `${label}: Set Property Once`,
      run: async () => (await group())?.setOnce('created', '2026-10-27'),
    },
    {
      title: `${label}: Union Property`,
      run: async () => (await group())?.union('tags', ['react-native']),
    },
    {
      title: `${label}: Remove Property`,
      run: async () => (await group())?.remove('tags', 'react-native'),
    },
    {
      title: `${label}: Unset Property`,
      run: async () => (await group())?.unset('tier'),
    },
    {
      title: `${label}: Delete Group`,
      run: async () => mixpanel.deleteGroup(groupKey, await groupId()),
    },
  ];

  const sections: Section[] = [
    {
      title: 'Identity',
      actions: [
        {
          title: 'Identify',
          run: () => mixpanel.identify({userId, companyId}),
        },
        {
          title: 'Invalid: Identify Without Company',
          run: () => mixpanel.identify({userId}),
        },
        {
          title: 'Invalid: Identify With Distinct ID',
          run: () => mixpanel.identify(userId),
        },
        {
          title: 'Invalid: Alias',
          run: () => mixpanel.alias('new_alias', userId),
        },
        {
          title: 'Show Identity',
          run: async () => {
            const identity = await mixpanel.getIdentity();
            const optedOut = await mixpanel.hasOptedOutTracking();
            const superProperties = await mixpanel.getSuperProperties();
            console.log(
              `${LOG_PREFIX} identity=${JSON.stringify(identity)} ` +
                `optedOut=${optedOut} ` +
                `superProperties=${JSON.stringify(superProperties)}`,
            );
          },
        },
      ],
    },
    {
      title: 'Opt Out and In',
      actions: [
        {title: 'Opt Out', run: () => mixpanel.optOutTracking()},
        {title: 'Opt In', run: () => mixpanel.optInTracking()},
        {
          title: 'Opt In With Identity',
          run: () => mixpanel.optInTrackingWithIdentity({userId, companyId}),
        },
      ],
    },
    {
      title: 'Events',
      actions: [
        {
          title: 'Track Event',
          run: () =>
            mixpanel.track('HG Event!', {source: 'hierarchical_groups_page'}),
        },
        {
          title: 'Set Team Group',
          run: () => mixpanel.setGroup('team_id', teamId),
        },
        {
          title: 'Invalid: Set Team Groups (List)',
          run: () => mixpanel.setGroup('team_id', [teamId]),
        },
        {
          title: 'Invalid: Add Team Group',
          run: () => mixpanel.addGroup('team_id', teamId),
        },
        {
          title: 'Remove Team Group',
          run: () => mixpanel.removeGroup('team_id', teamId),
        },
        {
          title: 'Track With Team Group',
          run: () =>
            mixpanel.trackWithGroups('HG Team Event!', undefined, {
              team_id: teamId,
            }),
        },
      ],
    },
    {
      // The user's profile ($user_id group profile)
      title: 'User Profile',
      actions: [
        {
          title: 'User: Set Property',
          run: () => mixpanel.getPeople().set('plan', 'enterprise'),
        },
        {
          title: 'User: Set Properties (Map)',
          run: () => mixpanel.getPeople().set({role: 'admin', seats: 5}),
        },
        {
          title: 'User: Set Property Once',
          run: () => mixpanel.getPeople().setOnce('first_seen', '2026-10-27'),
        },
        {
          title: 'User: Union Property',
          run: () =>
            mixpanel.getPeople().union('devices', ['ios', 'react-native']),
        },
        {
          title: 'User: Remove Property',
          run: () => mixpanel.getPeople().remove('devices', 'react-native'),
        },
        {
          title: 'User: Unset Property',
          run: () => mixpanel.getPeople().unset('plan'),
        },
        {
          title: 'Invalid: User Clear Charges',
          run: () => mixpanel.getPeople().clearCharges(),
        },
        {
          title: 'User: Delete User',
          run: () => mixpanel.getPeople().deleteUser(),
        },
        // Profile operations the $user_id group profile has no equivalent for, dropped with an
        // error log
        {
          title: 'Invalid: User Increment',
          run: () => mixpanel.getPeople().increment('logins', 1),
        },
        {
          title: 'Invalid: User Increment (Map)',
          run: () => mixpanel.getPeople().increment({logins: 1, sessions: 2}),
        },
        {
          title: 'Invalid: User Append',
          run: () => mixpanel.getPeople().append('history', 'opened_hg_page'),
        },
        {
          title: 'Invalid: User Track Charge',
          run: () => mixpanel.getPeople().trackCharge(9.99, {}),
        },
      ],
    },
    {
      title: 'Company',
      actions: groupActions(
        'Company',
        '$company_id',
        () => mixpanel.getCompany(),
        async () => (await mixpanel.getIdentity()).companyId,
      ),
    },
    {
      title: 'Team',
      actions: groupActions(
        'Team',
        'team_id',
        () => mixpanel.getGroup('team_id', teamId),
        () => teamId,
      ),
    },
    {
      title: 'Flush and Reset',
      actions: [
        {title: 'Flush', run: () => mixpanel.flush()},
        {title: 'Reset', run: () => mixpanel.reset()},
      ],
    },
  ];

  const runAction = async (action: Action) => {
    console.log(`${LOG_PREFIX} ===== ${action.title} =====`);
    try {
      await action.run();
    } catch (error) {
      console.error(`${LOG_PREFIX} ${action.title} failed:`, error);
    }
    // Flush after every call so its requests show up on their own
    mixpanel.flush();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Hierarchical Groups</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Back" onPress={onBack} />

          <Text style={styles.label}>User ID</Text>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Company ID</Text>
          <TextInput
            style={styles.input}
            value={companyId}
            onChangeText={setCompanyId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Team ID</Text>
          <TextInput
            style={styles.input}
            value={teamId}
            onChangeText={setTeamId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {sections.map(section => (
            <View key={section.title}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.actions.map(action => (
                <View key={action.title} style={styles.buttonWrapper}>
                  <Button
                    title={action.title}
                    onPress={() => runAction(action)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
  },
  buttonWrapper: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default HierarchicalGroupsPage;
