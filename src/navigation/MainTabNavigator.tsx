import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { DiscoveryScreen } from '../screens/discovery/DiscoveryScreen';
import { MyEventsScreen } from '../screens/events/MyEventsScreen';
import { CreateEventScreen } from '../screens/events/CreateEventScreen';
import { ConnectScreen } from '../screens/connect/ConnectScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface CreateTabButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
}

const CreateTabButton: React.FC<CreateTabButtonProps> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.createButton} activeOpacity={0.8}>
    <View style={styles.createButtonInner}>
      <Ionicons name="add" size={28} color={colors.bg.primary} />
    </View>
  </TouchableOpacity>
);

export const MainTabNavigator: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent.lime,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Discovery"
        component={DiscoveryScreen}
        options={{
          tabBarLabel: t('nav.discovery'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={MyEventsScreen}
        options={{
          tabBarLabel: t('nav.events'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateEventScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <CreateTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          tabBarLabel: t('nav.connect'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg.primary,
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  createButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.lime,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
