import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SolicitudExitosa({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const theme = useColorScheme(); 

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#333';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.navigate('Home'); 
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Ionicons name="checkmark-circle-outline" size={100} color="#4BB543" />
      </Animated.View>
      <Text style={[styles.text, { color: textColor }]}>¡Solicitud enviada con éxito!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginTop: 20,
  },
});
