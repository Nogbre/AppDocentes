import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  TouchableOpacity, Alert, ScrollView, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { SessionContext } from '../context/SessionContext';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 130;

export default function HomeScreen({ navigation }) {
  const { logout, docente } = useContext(SessionContext);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animComplete, setAnimComplete] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -(height - NAVBAR_HEIGHT),
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        setAnimComplete(true);
      });
    }, 100);
  }, []);

  const cargarSolicitudes = () => {
    if (docente?.id_docente) {
      setLoading(true);
      axios.get(`https://universidad-la9h.onrender.com/solicitudes-uso?id_docente=${docente.id_docente}`)
        .then(res => setSolicitudes(res.data))
        .catch(() => {
          Alert.alert("Error", "No se pudieron cargar las solicitudes.");
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [docente]);

  const onRefresh = () => {
    setIsRefreshing(true);
    cargarSolicitudes();
    setIsRefreshing(false);
  };

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

  const solicitudesFiltradas = solicitudes.filter(s => s.estado.toLowerCase() === filtro.toLowerCase());

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}>
        {animComplete && <View style={styles.logoContainer} />}
        <TouchableOpacity style={styles.navbar} onPress={toggleMenu}>
          <View style={styles.navbarContent}>
            <Ionicons 
              name={menuAbierto ? "chevron-up" : "chevron-down"} 
              size={30} 
              color="white" 
            />
            {menuAbierto && (
              <Text style={styles.navbarText}>Ocultar menú</Text>
            )}
          </View>
        </TouchableOpacity>
        {menuAbierto && (
          <View style={styles.menuContentCentered}>
            <Image 
              source={require('../assets/logo-2.png')} 
              style={styles.menuLogo} 
              resizeMode="contain"
            />
            <TouchableOpacity onPress={cerrarSesion} style={styles.logoutButton}>
              <Icon name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.text}>Solicitudes</Text>

        <View style={styles.filtroContainer}>
          {['pendiente', 'aprobada', 'rechazada'].map(estado => (
            <TouchableOpacity
              key={estado}
              style={[styles.filtroButton, filtro === estado && styles.filtroButtonActivo]}
              onPress={() => setFiltro(estado)}
            >
              <Text style={[styles.filtroButtonText, filtro === estado && styles.filtroButtonTextActivo]}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#592644" />
        ) : (
          <ScrollView
            style={{ marginTop: 20, width: '100%', maxHeight: '60%' }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          >
            {solicitudesFiltradas.length === 0 ? (
              <Text style={styles.noData}>No hay solicitudes {filtro}s.</Text>
            ) : (
              solicitudesFiltradas.map(s => {
                let estadoColor = '#ccc';
                if (s.estado.toLowerCase() === 'pendiente') estadoColor = '#f5a623';
                if (s.estado.toLowerCase() === 'aprobada') estadoColor = '#4caf50';
                if (s.estado.toLowerCase() === 'rechazada') estadoColor = '#e53935';

                return (
                  <TouchableOpacity 
                    key={s.id_solicitud} 
                    onPress={() => navigation.navigate('DetalleSolicitud', { solicitud: s })}
                  >
                    <View style={[styles.card, { borderLeftColor: estadoColor }]}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{s.practica_titulo}</Text>
                        <View style={[styles.badge, { backgroundColor: estadoColor }]}>
                          <Text style={styles.badgeText}>{s.estado}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardText}>Estudiantes: {s.numero_estudiantes}</Text>
                      <Text style={styles.cardText}>Laboratorio: {s.laboratorio_nombre}</Text>
                      <Text style={styles.cardText}>Fecha: {new Date(s.fecha_solicitud).toLocaleString()}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.solicitudButton}
          onPress={() => navigation.navigate('CrearSolicitud')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.solicitudButtonText}>Crear nueva solicitud</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
    top: 80,
    width: '100%',
    alignItems: 'center',
    zIndex: 11,
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
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
  },
  navbarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 90,
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#592644',
    textAlign: 'center',
    marginBottom: 10,
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 35,
    marginBottom: 20,
    width: '100%',
  },
  filtroButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  filtroButtonActivo: {
    backgroundColor: '#592644',
  },
  filtroButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  filtroButtonTextActivo: {
    color: 'white',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
    borderLeftWidth: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  solicitudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#592644',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  solicitudButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  menuContentCentered: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLogo: {
    height: 150,
    width: 300,
    marginTop: height * 0.2, // 20% de la altura de la pantalla
  },
  logoutButton: {
    backgroundColor: '#ffffff20',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 100,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
