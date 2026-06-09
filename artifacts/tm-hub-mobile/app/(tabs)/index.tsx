import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useProjects } from "@/lib/hooks";

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors = useColors();
  return (
    <View style={[cardStyles.stat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[cardStyles.statValue, { color: color ?? colors.foreground }]}>{value}</Text>
      <Text style={[cardStyles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  stat: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

const STATUS_COLORS: Record<string, string> = {
  "Pre-Production": "#EAB308",
  Production: "#FF5E00",
  "Post-Production": "#3B82F6",
  Delivered: "#22C55E",
  Archived: "#6B7280",
};

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: projects = [], isLoading } = useProjects();

  const active = projects.filter((p) => p.status !== "Archived" && p.status !== "Delivered");
  const inProduction = projects.filter((p) => p.status === "Production");
  const inPost = projects.filter((p) => p.status === "Post-Production");
  const delivered = projects.filter((p) => p.status === "Delivered");

  const paddingBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: paddingBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          Trademark Command
        </Text>
        <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground }}>
          Dashboard
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 24 }}>
        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard label="Active" value={String(active.length)} color={colors.primary} />
          <StatCard label="In Prod" value={String(inProduction.length)} />
          <StatCard label="Post" value={String(inPost.length)} />
          <StatCard label="Done" value={String(delivered.length)} color="#22C55E" />
        </View>

        {/* Recent Projects */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1 }}>
              Recent Projects
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/projects")}>
              <Text style={{ fontSize: 13, color: colors.primary, fontFamily: "Inter_500Medium" }}>View all</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : projects.length === 0 ? (
            <View style={[{ padding: 32, borderRadius: 12, borderWidth: 1, alignItems: "center" }, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="folder" size={32} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>No projects yet</Text>
              <Pressable onPress={() => router.push("/(tabs)/projects")} style={{ marginTop: 12 }}>
                <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>Create your first project</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {projects.slice(0, 5).map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() => router.push(`/project/${project.id}` as any)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="folder" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                      {project.type}
                    </Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: `${STATUS_COLORS[project.status] ?? colors.muted}20` }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: STATUS_COLORS[project.status] ?? colors.mutedForeground }}>
                      {project.status}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View>
          <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "New Project", icon: "plus-circle" as const, onPress: () => router.push("/(tabs)/projects") },
              { label: "Projects", icon: "folder" as const, onPress: () => router.push("/(tabs)/projects") },
              { label: "Assets", icon: "image" as const, onPress: () => router.push("/(tabs)/assets") },
            ].map((action) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    minWidth: "30%",
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                    alignItems: "center",
                    gap: 8,
                  },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                  <Feather name={action.icon} size={18} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, textAlign: "center" }}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
