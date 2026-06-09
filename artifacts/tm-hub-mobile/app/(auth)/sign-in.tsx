import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Sign in could not be completed. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.message ?? "Sign in failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const s = styles(colors, insets);

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.logoMark} />
          <Text style={s.title}>TM Hub</Text>
          <Text style={s.subtitle}>Sign in to continue</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
          />

          {error && <Text style={s.error}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [
              s.btn,
              pressed && s.btnPressed,
              (isLoading || !email || !password) && s.btnDisabled,
            ]}
            onPress={handleSignIn}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.btnText}>Sign in</Text>
            )}
          </Pressable>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text style={s.link}>Sign up</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// @ts-ignore
const styles = (colors: any, insets: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: insets.top + 60,
      paddingBottom: insets.bottom + 24,
    },
    header: { alignItems: "center", marginBottom: 40 },
    logoMark: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    form: { gap: 4 },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    error: {
      color: colors.destructive,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      marginTop: 8,
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 24,
    },
    btnPressed: { opacity: 0.85 },
    btnDisabled: { opacity: 0.5 },
    btnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
    footerText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    link: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
  });
