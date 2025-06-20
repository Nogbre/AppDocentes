import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, Alert, RefreshControl
} from 'react-native';
import { SessionContext } from '../context/SessionContext';
import { NotificationContext } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function NotificacionesScreen({ navigation }) {
  const { docente } = useContext(SessionContext);
  const { 
    solicitudes, 
    cargarSolicitudes, 
    notificacionesGuardadas, 
    guardarNotificaciones
  } = useContext(NotificationContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Marcar como leída
  const marcarComoLeida = async (notificacionId) => {
    const notificacionesActualizadas = notificacionesGuardadas.map(notif => 
      notif.id === notificacionId ? { ...notif, leida: true } : notif
    );
    await guardarNotificaciones(notificacionesActualizadas);
  };

  // Eliminar notificación
  const eliminarNotificacion = async (notificacionId) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const notificacionesActualizadas = notificacionesGuardadas.filter(
              notif => notif.id !== notificacionId
            );
            await guardarNotificaciones(notificacionesActualizadas);
          }
        }
      ]
    );
  };

  // Limpiar todas las notificaciones
  const limpiarTodas = async () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await guardarNotificaciones([]);
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await cargarSolicitudes();
    setIsRefreshing(false);
  };

  const getIconAndColor = (tipo) => {
    switch (tipo) {
      case 'success':
      case 'aprobada':
        return { icon: 'checkmark-circle', color: '#4caf50' };
      case 'error':
      case 'rechazada':
        return { icon: 'close-circle', color: '#e53935' };
      case 'warning':
      case 'pendiente':
        return { icon: 'warning', color: '#f5a623' };
      default:
        return { icon: 'information-circle', color: '#2196f3' };
    }
  };

  const formatTime = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diff = ahora - notifFecha;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'Ahora mismo';
  };

  const notificacionesNoLeidas = notificacionesGuardadas.filter(n => !n.leida).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#592644" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={styles.headerActions}>
          {notificacionesGuardadas.length > 0 && (
            <TouchableOpacity onPress={limpiarTodas} style={styles.clearButton}>
              <Ionicons name="trash" size={20} color="#e53935" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {notificacionesGuardadas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay notificaciones</Text>
            <Text style={styles.emptySubtext}>
              Las notificaciones aparecerán aquí cuando haya cambios en tus solicitudes
            </Text>
          </View>
        ) : (
          <>
            {notificacionesNoLeidas > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{notificacionesNoLeidas} no leída{notificacionesNoLeidas > 1 ? 's' : ''}</Text>
              </View>
            )}
            
            {notificacionesGuardadas.map((notificacion) => {
              const { icon, color } = getIconAndColor(notificacion.tipo);
              
              return (
                <TouchableOpacity
                  key={notificacion.id}
                  style={[
                    styles.notificationCard,
                    !notificacion.leida && styles.notificationCardUnread
                  ]}
                  onPress={() => marcarComoLeida(notificacion.id)}
                >
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationIcon}>
                      <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notificacion.titulo}</Text>
                      <Text style={styles.notificationMessage}>{notificacion.mensaje}</Text>
                      <Text style={styles.notificationTime}>{formatTime(notificacion.fecha)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => eliminarNotificacion(notificacion.id)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                  {!notificacion.leida && <View style={styles.unreadIndicator} />}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#592644',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  unreadBadge: {
    backgroundColor: '#592644',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#592644',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#592644',
  },
}); 