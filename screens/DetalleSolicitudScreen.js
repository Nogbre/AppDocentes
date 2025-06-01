import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function DetalleSolicitudScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { solicitud } = route.params;

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return '#f5a623';
      case 'aprobada': return '#4caf50';
      case 'rechazada': return '#e53935';
      default: return '#ccc';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#592644" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Solicitud</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{solicitud.practica_titulo}</Text>
            <View style={[styles.badge, { backgroundColor: getEstadoColor(solicitud.estado) }]}>
              <Text style={styles.badgeText}>{solicitud.estado}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información General</Text>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#592644" />
              <Text style={styles.infoText}>Número de Estudiantes: {solicitud.numero_estudiantes}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#592644" />
              <Text style={styles.infoText}>Laboratorio: {solicitud.laboratorio_nombre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#592644" />
              <Text style={styles.infoText}>
                Fecha de Solicitud: {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la Práctica</Text>
            <Text style={styles.description}>{solicitud.descripcion || 'No hay descripción disponible'}</Text>
          </View>

          {solicitud.observaciones && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observaciones</Text>
              <Text style={styles.description}>{solicitud.observaciones}</Text>
            </View>
          )}
        </View>
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
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#592644',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#592644',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
}); 