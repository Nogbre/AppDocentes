import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';
import { Picker } from '@react-native-picker/picker';
import SolicitudExitosa from '../components/SolicitudExitosa'; 

export default function CrearSolicitudScreen({ navigation }) {
  const { docente } = useContext(SessionContext);
  const [practicas, setPracticas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  const [numeroEstudiantes, setNumeroEstudiantes] = useState('');
  const [tamanoGrupo, setTamanoGrupo] = useState('3');
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false); 

  useEffect(() => {
   
    axios.get('https://universidad-la9h.onrender.com/practicas')
      .then(res => setPracticas(res.data))
      .catch(() => Alert.alert("Error", "No se pudieron cargar las prácticas."));
  }, []);

  const cargarInsumos = async (id_practica) => {
    console.log("Cargando insumos para la práctica con id:", id_practica);
    try {
      setLoading(true);
      const res = await axios.get(`https://universidad-la9h.onrender.com/practicas/${id_practica}/insumos`);
      console.log("Insumos cargados:", res.data);
      setInsumos(res.data);
    } catch (error) {
      console.error("Error cargando los insumos:", error);
      Alert.alert("Error", "No se pudieron cargar los insumos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionPractica = (itemValue) => {
    const seleccionada = practicas.find(practica => practica.id_practica === itemValue);
    setPracticaSeleccionada(seleccionada);
    cargarInsumos(itemValue);
  };

  const calcularCantidadTotal = (porGrupo) => {
    const grupos = Math.ceil(parseInt(numeroEstudiantes || '0') / parseInt(tamanoGrupo || '1'));
    return porGrupo * grupos;
  };

  const handleEnviar = async () => {
  if (!practicaSeleccionada || !numeroEstudiantes) {
    return Alert.alert("Error", "Completa todos los campos.");
  }

  const payload = {
    id_docente: docente?.id_docente,
    id_practica: practicaSeleccionada.id_practica,
    id_laboratorio: practicaSeleccionada.id_laboratorio,
    fecha_hora_inicio: new Date().toISOString(),
    fecha_hora_fin: new Date(Date.now() + 3600000).toISOString(),
    numero_estudiantes: parseInt(numeroEstudiantes),
    tamano_grupo: parseInt(tamanoGrupo),
  };

  try {
    setLoading(true);
    await axios.post('https://universidad-la9h.onrender.com/solicitudes-uso', payload);
    setLoading(false);
    navigation.navigate('SolicitudExitosa');  // Redirigir a la pantalla de animación
  } catch (e) {
    setLoading(false);
    Alert.alert("Error", e.response?.data?.message || "Error al crear solicitud.");
  }
};


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.mainTitle}>Crear Solicitud</Text>
            <Text style={styles.title}>Selecciona una práctica</Text>
            {loading && <ActivityIndicator size="small" color="#592644" />}
            <Picker
              selectedValue={practicaSeleccionada?.id_practica}
              onValueChange={handleSeleccionPractica}
              style={styles.picker}
            >
              {practicas.map(practica => (
                <Picker.Item key={practica.id_practica} label={practica.titulo} value={practica.id_practica} />
              ))}
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Número de estudiantes"
              keyboardType="numeric"
              value={numeroEstudiantes}
              onChangeText={setNumeroEstudiantes}
            />

            <TextInput
              style={styles.input}
              placeholder="Tamaño de grupo (opcional)"
              keyboardType="numeric"
              value={tamanoGrupo}
              onChangeText={setTamanoGrupo}
            />

            {insumos.length > 0 && (
              <View style={styles.cardContainer}>
                <Text style={styles.subtitle}>Insumos requeridos</Text>
                {insumos.map(insumo => (
                  <View key={insumo.id_insumo} style={styles.card}>
                    <Text style={styles.insumoText}>{insumo.insumo_nombre}</Text>
                    <Text style={styles.insumoTextSmall}>
                      {insumo.cantidad_requerida} x grupo → Total: {calcularCantidadTotal(insumo.cantidad_requerida)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {solicitudEnviada && <SolicitudExitosa />}  

            <TouchableOpacity style={styles.button} onPress={handleEnviar}>
              <Text style={styles.buttonText}>Enviar Solicitud</Text>
            </TouchableOpacity>
          </>
        }
        data={[]}
        renderItem={null}
        contentContainerStyle={styles.scroll}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 40, paddingBottom: 60 },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#592644',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subtitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginVertical: 12,
    backgroundColor: '#fff',
  },
  input: {
    marginVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333',
  },
  cardContainer: { marginTop: 20 },
  card: {
    padding: 16,
    backgroundColor: '#eaeaea',
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  insumoText: { fontWeight: '600', fontSize: 16, color: '#333' },
  insumoTextSmall: { fontSize: 14, color: '#555' },
  button: {
    marginTop: 30,
    backgroundColor: '#592644',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  confirmationMessage: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
