import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CrearSolicitudScreen from './screens/CrearSolicitudScreen';
import SolicitudExitosa from './components/SolicitudExitosa';
import DetalleSolicitudScreen from './screens/DetalleSolicitudScreen';
import NotificacionesScreen from './screens/NotificacionesScreen';
import NotificationPermissions from './components/NotificationPermissions';

import { SessionProvider, SessionContext } from './context/SessionContext';
import { NotificationProvider, NotificationContext } from './context/NotificationContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { docente, isLoading } = useContext(SessionContext);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {docente ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CrearSolicitud" component={CrearSolicitudScreen} />
            <Stack.Screen name="SolicitudExitosa" component={SolicitudExitosa} />
            <Stack.Screen name="DetalleSolicitud" component={DetalleSolicitudScreen} />
            <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { showPermissionModal, closePermissionModal, onPermissionGranted } = useContext(NotificationContext);

  return (
    <>
      <AppNavigator />
      <NotificationPermissions
        visible={showPermissionModal}
        onClose={closePermissionModal}
        onPermissionGranted={onPermissionGranted}
      />
    </>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </SessionProvider>
  );
} 