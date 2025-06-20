import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LastUpdateIndicator = ({ lastUpdate, isPolling }) => {
  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `Hace ${minutes}m ${seconds}s`;
    } else {
      return `Hace ${seconds}s`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Ionicons 
          name={isPolling ? "sync" : "checkmark-circle"} 
          size={16} 
          color={isPolling ? "#592644" : "#4caf50"} 
          style={[styles.icon, isPolling && styles.rotating]}
        />
        <Text style={styles.statusText}>
          {isPolling ? 'Actualizando...' : 'Actualizado'}
        </Text>
      </View>
      {lastUpdate && (
        <Text style={styles.timeText}>
          {formatTime(lastUpdate)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
  },
});

export default LastUpdateIndicator; 