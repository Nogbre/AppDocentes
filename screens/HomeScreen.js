import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { SessionContext } from '../context/SessionContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 130;

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout, docente } = useContext(SessionContext);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animComplete, setAnimComplete] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -(height - NAVBAR_HEIGHT),
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      setAnimComplete(true);
    });
  }, []);

  useEffect(() => {
    if (docente?.id_docente) {
      axios.get(`https://universidad-la9h.onrender.com/solicitudes-uso?id_docente=${docente.id_docente}`)
        .then(res => setSolicitudes(res.data))
        .catch(() => Alert.alert("Error", "No se pudieron cargar las solicitudes."))
        .finally(() => setLoading(false));
    }
  }, [docente]);

  const toggleMenu = () => {
    const toValue = menuAbierto ? -(height - NAVBAR_HEIGHT) : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setMenuAbierto(!menuAbierto);
  };

  const cerrarSesion = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}>
        {animComplete && (
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo-2.png')} style={styles.logo} />
          </View>
        )}

        <TouchableOpacity style={styles.navbar} onPress={toggleMenu}>
          <Text style={styles.navbarText}>HOME</Text>
        </TouchableOpacity>

        {menuAbierto && (
          <View style={styles.menuContentCentered}>
            <TouchableOpacity onPress={cerrarSesion}>
              <Text style={[styles.menuText, { color: '#ffdddd', marginTop: 30 }]}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.text}>Solicitudes de {docente?.nombre}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#592644" />
        ) : (
          <ScrollView style={{ marginTop: 20, width: '100%' }}>
            {solicitudes.length === 0 ? (
              <Text style={styles.noData}>No hay solicitudes registradas.</Text>
            ) : (
              solicitudes.map(s => (
                <View key={s.id_solicitud} style={styles.card}>
                  <Text style={styles.cardTitle}>{s.practica_titulo}</Text>
                  <Text style={styles.cardText}>Estudiantes: {s.numero_estudiantes}</Text>
                  <Text style={styles.cardText}>Estado: {s.estado}</Text>
                  <Text style={styles.cardText}>Laboratorio: {s.laboratorio_nombre}</Text>
                  <Text style={styles.cardText}>Fecha: {new Date(s.fecha_solicitud).toLocaleString()}</Text>
                </View>
              ))
            )}
            <TouchableOpacity style={styles.solicitudButton} onPress={() => navigation.navigate('CrearSolicitud')}>
              <Text style={styles.solicitudButtonText}>+ Crear nueva solicitud</Text>
            </TouchableOpacity>

          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height,
    backgroundColor: '#592644',
    zIndex: 10,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 11,
  },
  logo: {
    marginTop: 60,
    height: 170,
    width: 170,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    height: NAVBAR_HEIGHT,
    width: '100%',
    backgroundColor: '#592644',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  navbarText: {
    marginTop: 50,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    zIndex: 1,
    padding: 20,
    paddingTop: 30,
    flex: 1,
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#592644',
    textAlign: 'center',
  },
  menuContentCentered: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -50 }],
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: 'white',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },
  solicitudButton: {
    backgroundColor: '#592644',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 10
  },
  solicitudButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  
});
