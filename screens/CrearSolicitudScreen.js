import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import axios from 'axios';
import { SessionContext } from '../context/SessionContext';

export default function CrearSolicitudScreen({ navigation }) {
  const { docente } = useContext(SessionContext);
  const [practicas, setPracticas] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  const [numeroEstudiantes, setNumeroEstudiantes] = useState('');
  const [tamanoGrupo, setTamanoGrupo] = useState('3');
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSeleccionPractica = (practica) => {
    setPracticaSeleccionada(practica);
    cargarInsumos(practica.id_practica);
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
      await axios.post('https://universidad-la9h.onrender.com/solicitudes-uso', payload);
      Alert.alert("Éxito", "Solicitud creada correctamente.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Error al crear solicitud.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Selecciona una práctica</Text>
            {loading && <ActivityIndicator size="small" color="#592644" />}
            <FlatList
              data={practicas}
              keyExtractor={item => item.id_practica.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.practicaItem,
                    practicaSeleccionada?.id_practica === item.id_practica && styles.selected
                  ]}
                  onPress={() => handleSeleccionPractica(item)}
                >
                  <Text>{item.titulo}</Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
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
  scroll: { padding: 50, paddingBottom: 60 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { marginTop: 15, fontWeight: 'bold', fontSize: 16 },
  practicaItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  selected: { backgroundColor: '#ddd' },
  input: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    borderColor: '#ccc'
  },
  cardContainer: { marginTop: 10 },
  card: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  insumoText: { fontWeight: '600' },
  insumoTextSmall: { fontSize: 12, color: '#555' },
  button: {
    marginTop: 25,
    backgroundColor: '#592644',
    padding: 15,
    borderRadius: 10
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold'
  }
});
