import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DocumentProvider } from "./contexts/DocumentContext";
import { RootStackParamList } from "./navigation/types";
import CategoriesListView from "./views/CategoriesListView";
import DocumentDetailView from "./views/DocumentDetailView";
import DocumentFormView from "./views/DocumentFormView";
import DocumentsListView from "./views/DocumentsListView";
import LoginView from "./views/LoginView";
import ProfileView from "./views/ProfileView";

const Stack = createNativeStackNavigator<RootStackParamList>();
const DocsStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const DocumentsStackScreens = () => (
  <DocsStack.Navigator>
    <DocsStack.Screen
      name="DocumentsList"
      component={DocumentsListView}
      options={{ title: "Documents" }}
    />
    <DocsStack.Screen
      name="DocumentDetail"
      component={DocumentDetailView}
      options={{ title: "Détail" }}
    />
    <DocsStack.Screen
      name="DocumentForm"
      component={DocumentFormView}
      options={{ title: "Éditer" }}
    />
  </DocsStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: true }}>
    <Tab.Screen
      name="Documents"
      component={DocumentsStackScreens}
      options={{ headerShown: false }}
    />
    <Tab.Screen name="Catégories" component={CategoriesListView} />
    <Tab.Screen name="Profil" component={ProfileView} />
  </Tab.Navigator>
);

const Root = () => {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginView} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <Root />
      </DocumentProvider>
    </AuthProvider>
  );
}
