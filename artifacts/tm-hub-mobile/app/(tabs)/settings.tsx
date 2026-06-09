import { useAuth, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function Row({ icon, label, onPress, destructive }: { icon: string; label: string; onPress: () => void; destructive?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 12,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Feather name={icon as any} size={18} color={destructive ? colors.destructive : colors.mutedForeground} />
      <Text style={{ flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: destructive ? colors.destructive : colors.foreground }}>
        {label}
      </Text>
      {!destructive && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user, isLoaded } = useUser();

  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: paddingBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 16, paddingHorizontal: 20, paddingBottom: 24 }}>
        <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          Trademark Command
        </Text>
        <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground }}>Settings</Text>
      </View>

      {/* Profile Card */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: `${colors.primary}25`, alignItems: "center", justifyContent: "center" }}>
            {!isLoaded ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.primary }}>
                {user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "U"}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
              {user?.fullName ?? user?.firstName ?? "User"}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }} numberOfLines={1}>
              {user?.emailAddresses?.[0]?.emailAddress ?? ""}
            </Text>
          </View>
        </View>
      </View>

      {/* App Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          App
        </Text>
      </View>
      <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginHorizontal: 20, marginBottom: 24, overflow: "hidden" }}>
        <Row icon="info" label="About TM Hub" onPress={() => {}} />
        <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 46 }} />
        <Row icon="star" label="Rate the App" onPress={() => {}} />
      </View>

      {/* Account Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
        <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Account
        </Text>
      </View>
      <View style={{ backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginHorizontal: 20, overflow: "hidden" }}>
        <Row icon="log-out" label="Sign Out" onPress={handleSignOut} destructive />
      </View>

      <View style={{ alignItems: "center", marginTop: 32 }}>
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
          TM Hub Mobile v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
