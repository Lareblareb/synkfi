import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ProfileSetup: undefined;
};

export type MainTabParamList = {
  Discovery: undefined;
  Events: undefined;
  Create: undefined;
  Connect: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  EventDetail: { eventId: string };
  EditEvent: { eventId: string };
  PaymentConfirm: { eventId: string; amount: number };
  GroupChat: { eventId: string; eventTitle: string };
  DirectMessage: { userId: string; userName: string };
  Inbox: undefined;
  Notifications: undefined;
  PublicProfile: { userId: string };
  EditProfile: undefined;
  Settings: undefined;
  About: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
