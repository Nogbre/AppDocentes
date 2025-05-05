import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  Image, TouchableOpacity, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 130;

export default function HomeScreen({ navigation }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [animComplete, setAnimComplete] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

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
      await AsyncStorage.removeItem('docente');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
      console.error('Cerrar sesión error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}>
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
            <Text style={styles.menuText}>Laboratorios</Text>
            <Text style={styles.menuText}>Insumos en Uso</Text>
            <Text style={styles.menuText}>En desarrollo</Text>

            <TouchableOpacity onPress={cerrarSesion}>
              <Text style={[styles.menuText, { color: '#ffdddd', marginTop: 30 }]}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.text}>Hola Mundo</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#592644',
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
});