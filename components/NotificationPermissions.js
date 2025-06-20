import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications no está disponible:', error);
  Notifications = null;
}

export default function NotificationPermissions({ visible, onClose, onPermissionGranted }) {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermissions = async () => {
    if (!Notifications) {
      Alert.alert(
        'Notificaciones no disponibles',
        'Las notificaciones push no están disponibles en este dispositivo.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    setIsRequesting(true);
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permisos denegados',
          'Para recibir notificaciones sobre cambios en tus solicitudes, necesitas habilitar los permisos de notificaciones en la configuración de tu dispositivo.',
          [
            { text: 'Más tarde', onPress: onClose },
            { text: 'Configuración', onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openURL('package:com.yourapp');
              }
            }}
          ]
        );
        return;
      }
      
      onPermissionGranted();
    } catch (error) {
      console.log('Error al solicitar permisos:', error);
      Alert.alert(
        'Error',
        'No se pudieron solicitar los permisos de notificaciones.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const skipPermissions = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={60} color="#592644" />
          </View>
          
          <Text style={styles.title}>¿Te gustaría recibir notificaciones?</Text>
          
          <Text style={styles.description}>
            Te notificaremos cuando tus solicitudes de uso de laboratorio sean aprobadas, rechazadas o cambien de estado.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={requestPermissions}
              disabled={isRequesting}
            >
              <Text style={styles.primaryButtonText}>
                {isRequesting ? 'Solicitando...' : 'Permitir notificaciones'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={skipPermissions}
            >
              <Text style={styles.secondaryButtonText}>Más tarde</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#592644',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#592644',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
}); 