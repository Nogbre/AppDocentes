import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
  Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { SessionContext } from '../context/SessionContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function FormularioSolicitudPage() {
  const navigation = useNavigation();
  const { docente } = useContext(SessionContext);
  const [practicas, setPracticas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  const [tipoPractica, setTipoPractica] = useState('planificada');
  const [numeroEstudiantes, setNumeroEstudiantes] = useState('');
  const [tamanoGrupo, setTamanoGrupo] = useState('0');
  const [observaciones, setObservaciones] = useState('');
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaReserva, setFechaReserva] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFin, setHoraFin] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    axios.get('https://universidad-la9h.onrender.com/practicas')
      .then(res => setPracticas(res.data))
      .catch(() => Alert.alert("Error", "No se pudieron cargar las prácticas."));
  }, []);

  const cargarInsumos = async (id_practica) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://universidad-la9h.onrender.com/practicas/${id_practica}/insumos`);
      setInsumos(res.data);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los insumos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionPractica = (id) => {
    const seleccionada = practicas.find(p => p.id_practica === id);
    setPracticaSeleccionada(seleccionada);
    cargarInsumos(id);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate instanceof Date) {
      const minimumDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (selectedDate < minimumDate) {
        Alert.alert("Error", "La reserva debe hacerse con al menos 24 horas de anticipación.");
        return;
      }
      setFechaReserva(selectedDate);
    }
  };

  const handleStartTimeChange = (_, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime instanceof Date) {
      const fechaHoraSeleccionada = new Date(fechaReserva);
      fechaHoraSeleccionada.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      
      const minimumDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      if (fechaHoraSeleccionada < minimumDateTime) {
        Alert.alert("Error", "La hora seleccionada debe ser al menos 24 horas después de la hora actual.");
        return;
      }
      setHoraInicio(selectedTime);
    }
  };

  const handleEndTimeChange = (_, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime instanceof Date) {
      if (selectedTime <= horaInicio) {
        Alert.alert("Error", "La hora de fin debe ser posterior a la hora de inicio");
        return;
      }
      setHoraFin(selectedTime);
    }
  };

  const calcularCantidadTotal = (porGrupo) => {
    const grupos = Math.ceil(parseInt(numeroEstudiantes || '0') / parseInt(tamanoGrupo || '1'));
    return porGrupo * grupos;
  };

  const handleEnviar = async () => {
    if (!practicaSeleccionada || !numeroEstudiantes) {
      return Alert.alert("Error", "Completa todos los campos obligatorios.");
    }

    const fechaHoraInicio = new Date(fechaReserva);
    fechaHoraInicio.setHours(horaInicio.getHours(), horaInicio.getMinutes());

    const fechaHoraFin = new Date(fechaReserva);
    fechaHoraFin.setHours(horaFin.getHours(), horaFin.getMinutes());

    if (fechaHoraFin <= fechaHoraInicio) {
      return Alert.alert("Error", "La hora de fin debe ser posterior a la hora de inicio");
    }

    const ahora = new Date();
    const minimumDateTime = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    if (fechaHoraInicio < minimumDateTime) {
      return Alert.alert("Error", "La reserva debe hacerse con al menos 24 horas de anticipación.");
    }

    const payload = {
      id_docente: docente?.id_docente,
      id_practica: practicaSeleccionada.id_practica,
      id_laboratorio: practicaSeleccionada.id_laboratorio,
      fecha_hora_inicio: fechaHoraInicio.toISOString(),
      fecha_hora_fin: fechaHoraFin.toISOString(),
      numero_estudiantes: parseInt(numeroEstudiantes),
      tamano_grupo: parseInt(tamanoGrupo),
      observaciones: observaciones || "Sin observaciones",
      insumos: insumos.map(i => ({
        id_insumo: i.id_insumo,
        cantidad_por_grupo: i.cantidad_requerida
      }))
    };

    try {
      setLoading(true);
      await axios.post('https://universidad-la9h.onrender.com/solicitudes-uso', payload);
      navigation.navigate('SolicitudExitosa');

    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Error al crear solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crear Solicitud</Text>
          {loading && <ActivityIndicator size="small" color="#592644" />}

          <Text style={styles.label}>Tipo de práctica</Text>
          <View style={styles.tipoPracticaContainer}>
            <TouchableOpacity 
              style={[
                styles.tipoPracticaButton, 
                tipoPractica === 'planificada' && styles.tipoPracticaButtonSelected
              ]}
              onPress={() => setTipoPractica('planificada')}
            >
              <Text style={[
                styles.tipoPracticaText,
                tipoPractica === 'planificada' && styles.tipoPracticaTextSelected
              ]}>Planificada</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tipoPracticaButton, 
                tipoPractica === 'reposicion' && styles.tipoPracticaButtonSelected
              ]}
              onPress={() => setTipoPractica('reposicion')}
            >
              <Text style={[
                styles.tipoPracticaText,
                tipoPractica === 'reposicion' && styles.tipoPracticaTextSelected
              ]}>Reposición</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fecha de reserva</Text>
          <TouchableOpacity style={styles.datetimeInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datetimeText}>{formatDate(fechaReserva)}</Text>
            <Ionicons name="calendar" size={20} color="#592644" />
          </TouchableOpacity>

          <Text style={styles.label}>Horario</Text>
          <View style={styles.timeContainer}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.sublabel}>Hora inicio</Text>
              <TouchableOpacity style={styles.datetimeInput} onPress={() => setShowStartTimePicker(true)}>
                <Text style={styles.datetimeText}>{formatTime(horaInicio)}</Text>
                <Ionicons name="time-outline" size={20} color="#592644" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sublabel}>Hora fin</Text>
              <TouchableOpacity style={styles.datetimeInput} onPress={() => setShowEndTimePicker(true)}>
                <Text style={styles.datetimeText}>{formatTime(horaFin)}</Text>
                <Ionicons name="time-outline" size={20} color="#592644" />
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker value={fechaReserva} mode="date" display="spinner" onChange={handleDateChange} minimumDate={new Date()} locale="es-ES" />
          )}
          {showStartTimePicker && (
            <DateTimePicker value={horaInicio} mode="time" display="spinner" onChange={handleStartTimeChange} locale="es-ES" />
          )}
          {showEndTimePicker && (
            <DateTimePicker value={horaFin} mode="time" display="spinner" onChange={handleEndTimeChange} locale="es-ES" />
          )}

          <Text style={styles.label}>Práctica</Text>
          <Picker 
            selectedValue={practicaSeleccionada?.id_practica} 
            onValueChange={handleSeleccionPractica} 
            style={styles.picker} 
            dropdownIconColor="#592644"
          >
            <Picker.Item label="Selecciona una práctica..." value={null} color="#999" />
            {practicas.map(p => <Picker.Item key={p.id_practica} label={p.titulo} value={p.id_practica} color="#000" />)}
          </Picker>

          <Text style={styles.label}>Número de estudiantes *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ingrese el número de estudiantes" 
            keyboardType="numeric" 
            value={numeroEstudiantes} 
            onChangeText={setNumeroEstudiantes} 
          />
          
          <Text style={styles.label}>Tamaño de grupo</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ingrese el tamaño de grupo (opcional)" 
            keyboardType="numeric" 
            value={tamanoGrupo} 
            onChangeText={setTamanoGrupo} 
          />
          
          <Text style={styles.label}>Observaciones</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Ingrese observaciones adicionales (opcional)"
            multiline
            numberOfLines={4}
            value={observaciones}
            onChangeText={setObservaciones}
          />

          {insumos.length > 0 && (
            <View style={styles.insumosContainer}>
              <Text style={styles.insumosTitle}>Insumos requeridos</Text>
              {insumos.map(i => (
                <View key={i.id_insumo} style={styles.insumoRow}>
                  <Text style={styles.insumoNombre}>{i.insumo_nombre}</Text>
                  <Text style={styles.insumoCantidad}>{calcularCantidadTotal(i.cantidad_requerida)} {i.unidad_medida}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleEnviar}>
            <Text style={styles.buttonText}>Enviar Solicitud</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    backgroundColor: Platform.OS === 'ios' ? '#DADADA' : '#FFFFFF',
    paddingTop: 70 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#592644',
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  insumosContainer: { 
    marginVertical: 10,
    width: '100%'
  },
  button: {
    backgroundColor: '#592644',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
  },
  insumosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  insumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  insumoNombre: {
    fontSize: 16,
    color: '#333',
  },
  insumoCantidad: {
    fontSize: 16,
    fontWeight: '600',
    color: '#592644',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#eee',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  datetimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  datetimeText: {
    fontSize: 16,
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  tipoPracticaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tipoPracticaButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tipoPracticaButtonSelected: {
    backgroundColor: '#592644',
    borderColor: '#592644',
  },
  tipoPracticaText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tipoPracticaTextSelected: {
    color: '#fff',
  },
});