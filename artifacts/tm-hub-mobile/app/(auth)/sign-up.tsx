import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.message ?? "Sign up failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Verification could not be completed.");
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage ?? err?.message ?? "Verification failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const s = styles(colors, insets);

  if (verifying) {
    return (
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={s.container}>
          <View style={s.header}>
            <View style={s.logoMark} />
            <Text style={s.title}>Verify email</Text>
            <Text style={s.subtitle}>Check your inbox for a code</Text>
          </View>
          <View style={s.form}>
            <Text style={s.label}>Verification code</Text>
            <TextInput
              style={s.input}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              autoFocus
            />
            {error && <Text style={s.error}>{error}</Text>}
            <Pressable
              style={({ pressed }) => [s.btn, pressed && s.btnPressed, (isLoading || !code) && s.btnDisabled]}
              onPress={handleVerify}
              disabled={isLoading || !code}
            >
              {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Verify</Text>}
            </Pressable>
            <Pressable
              style={s.resend}
              onPress={() => signUp?.prepareEmailAddressVerification({ strategy: "email_code" })}
            >
              <Text style={s.link}>Resend code</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.logoMark} />
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Get started with TM Hub</Text>
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
            style={({ pressed }) => [s.btn, pressed && s.btnPressed, (isLoading || !email || !password) && s.btnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Sign up</Text>}
          </Pressable>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text style={s.link}>Sign in</Text>
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
    resend: { alignItems: "center", marginTop: 16 },
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
