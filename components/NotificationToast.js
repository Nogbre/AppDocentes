import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const NotificationToast = ({ 
  visible, 
  message, 
  type = 'info', 
  onClose, 
  onPress,
  duration = 4000 
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto cerrar después del tiempo especificado
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
    });
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#4caf50' };
      case 'error':
        return { icon: 'close-circle', color: '#e53935' };
      case 'warning':
        return { icon: 'warning', color: '#f5a623' };
      case 'info':
      default:
        return { icon: 'information-circle', color: '#2196f3' };
    }
  };

  const { icon, color } = getIconAndColor();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <Ionicons name={icon} size={24} color={color} style={styles.icon} />
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});

export default NotificationToast; 