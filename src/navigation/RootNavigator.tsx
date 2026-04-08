import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { EventDetailScreen } from '../screens/discovery/EventDetailScreen';
import { EditEventScreen } from '../screens/events/EditEventScreen';
import { PaymentConfirmScreen } from '../screens/events/PaymentConfirmScreen';
import { GroupChatScreen } from '../screens/chat/GroupChatScreen';
import { DirectMessageScreen } from '../screens/chat/DirectMessageScreen';
import { InboxScreen } from '../screens/chat/InboxScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { PublicProfileScreen } from '../screens/connect/PublicProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { AboutScreen } from '../screens/about/AboutScreen';
import { useAuthStore } from '../store/auth';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isProfileComplete = useAuthStore((s) => s.isProfileComplete);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="EditEvent" component={EditEventScreen} />
          <Stack.Screen
            name="PaymentConfirm"
            component={PaymentConfirmScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="GroupChat" component={GroupChatScreen} />
          <Stack.Screen name="DirectMessage" component={DirectMessageScreen} />
          <Stack.Screen name="Inbox" component={InboxScreen} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
