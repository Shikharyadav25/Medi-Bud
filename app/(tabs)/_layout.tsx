import React from "react";
import { Tabs } from "expo-router";
import { colors } from "@/theme/tokens";
import { LayoutDashboard, Stethoscope, MessageSquare, Bell, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size || 22} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="triage"
        options={{
          title: "Triage",
          tabBarIcon: ({ color, size }) => (
            <Stethoscope size={size || 22} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Chat",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size || 22} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: "Meds",
          tabBarIcon: ({ color, size }) => (
            <Bell size={size || 22} color={color} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={size || 22} color={color} strokeWidth={1.75} />
          ),
        }}
      />
    </Tabs>
  );
}
