import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionContext } from './SessionContext';

let Notifications;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications no está disponible:', error);
  Notifications = null;
}

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [notificacionesGuardadas, setNotificacionesGuardadas] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isUserInHome, setIsUserInHome] = useState(false);
  const ultimosEstadosRef = useRef(new Map());
  const { docente } = useContext(SessionContext);

  const checkNotificationPermissions = async () => {
    if (!Notifications) return;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      
      const permissionAsked = await AsyncStorage.getItem('notification_permission_asked');
      const permissionGranted = await AsyncStorage.getItem('notification_permission_granted');
      const permissionSkipped = await AsyncStorage.getItem('notification_permission_skipped');
      
      if (!permissionAsked && !permissionGranted && !permissionSkipped) {
        setShowPermissionModal(true);
        await AsyncStorage.setItem('notification_permission_asked', 'true');
      }
    } catch (error) {
      setPermissionStatus('denied');
    }
  };

  const setupNotifications = () => {
    if (!Notifications) return;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.log('Error al configurar notificaciones:', error);
    }
  };

  const sendLocalNotification = async (title, body, data = {}) => {
    if (!Notifications) return;
    
    if (permissionStatus !== 'granted') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Error al enviar notificación local:', error);
    }
  };

  const cargarNotificacionesGuardadas = async () => {
    if (!docente?.id_docente) return;
    
    try {
      const notificaciones = await AsyncStorage.getItem(`notificaciones_${docente.id_docente}`);
      if (notificaciones) {
        setNotificacionesGuardadas(JSON.parse(notificaciones));
      }
      
      const ultimosEstadosGuardados = await AsyncStorage.getItem(`ultimos_estados_${docente.id_docente}`);
      if (ultimosEstadosGuardados) {
        const mapCargado = new Map(JSON.parse(ultimosEstadosGuardados));
        ultimosEstadosRef.current = mapCargado;
      } else {
        ultimosEstadosRef.current = new Map();
      }
    } catch (error) {
      console.log('Error al cargar notificaciones guardadas:', error);
      ultimosEstadosRef.current = new Map();
    }
  };

  const guardarNotificaciones = async (nuevasNotificaciones) => {
    if (!docente?.id_docente) return;
    
    try {
      await AsyncStorage.setItem(`notificaciones_${docente.id_docente}`, JSON.stringify(nuevasNotificaciones));
      setNotificacionesGuardadas(nuevasNotificaciones);
    } catch (error) {
      console.log('Error al guardar notificaciones:', error);
    }
  };

  const guardarUltimosEstados = async (ultimosEstados) => {
    if (!docente?.id_docente) return;
    
    try {
      const datosAGuardar = JSON.stringify([...ultimosEstados]);
      await AsyncStorage.setItem(`ultimos_estados_${docente.id_docente}`, datosAGuardar);
    } catch (error) {
      console.log('Error al guardar últimos estados:', error);
    }
  };

  const detectarCambios = (solicitudesAnteriores, solicitudesNuevas) => {
    if (solicitudesAnteriores.length === 0) return;
    
    console.log('🔍 Detectando cambios...');
    console.log('📋 Últimos estados conocidos:', Object.fromEntries(ultimosEstadosRef.current));
    console.log('🔄 Solicitudes anteriores:', solicitudesAnteriores.length);
    console.log('🆕 Solicitudes nuevas:', solicitudesNuevas.length);
    
    solicitudesNuevas.forEach(nuevaSolicitud => {
      const ultimoEstadoConocido = ultimosEstadosRef.current.get(nuevaSolicitud.id_solicitud);
      const solicitudAnterior = solicitudesAnteriores.find(s => s.id_solicitud === nuevaSolicitud.id_solicitud);
      
      console.log(`📋 Solicitud ${nuevaSolicitud.id_solicitud}:`);
      console.log(`   Estado anterior (React): "${solicitudAnterior?.estado}"`);
      console.log(`   Estado nuevo (API): "${nuevaSolicitud.estado}"`);
      console.log(`   Último estado conocido (Map): "${ultimoEstadoConocido}"`);
      
      // Si no hay estado en el Map, usar el estado anterior de React
      const estadoParaComparar = ultimoEstadoConocido || solicitudAnterior?.estado;
      
      if (estadoParaComparar && estadoParaComparar !== nuevaSolicitud.estado) {
        console.log(`   ✅ Cambio detectado!`);
        console.log(`   🔔 Mostrando notificación...`);
        mostrarNotificacionCambioEstado(nuevaSolicitud, estadoParaComparar);
      } else if (!estadoParaComparar) {
        console.log(`   🆕 Nueva solicitud detectada`);
      } else {
        console.log(`   ⏭️ Sin cambios`);
      }
      
      // Siempre actualizar el Map con el estado actual
      const estadoAnteriorEnMap = ultimosEstadosRef.current.get(nuevaSolicitud.id_solicitud);
      ultimosEstadosRef.current.set(nuevaSolicitud.id_solicitud, nuevaSolicitud.estado);
      guardarUltimosEstados(ultimosEstadosRef.current);
      console.log(`   💾 Guardado estado: ${nuevaSolicitud.estado} (antes era: ${estadoAnteriorEnMap})`);
    });
  };

  const mostrarNotificacionCambioEstado = (solicitud, estadoAnterior) => {
    console.log('🔔 Mostrando notificación de cambio:');
    console.log('   Solicitud:', solicitud.practica_titulo);
    console.log('   Estado anterior:', estadoAnterior);
    console.log('   Estado nuevo:', solicitud.estado);
    
    let mensaje = '';
    let tipo = 'info';
    let titulo = '';
    
    if (solicitud.estado.toLowerCase() === 'aprobada') {
      titulo = '¡Solicitud Aprobada!';
      mensaje = `¡Tu solicitud "${solicitud.practica_titulo}" ha sido aprobada!`;
      tipo = 'success';
    } else if (solicitud.estado.toLowerCase() === 'rechazada') {
      titulo = 'Solicitud Rechazada';
      mensaje = `Tu solicitud "${solicitud.practica_titulo}" ha sido rechazada.`;
      tipo = 'error';
    } else if (solicitud.estado.toLowerCase() === 'pendiente') {
      titulo = 'Solicitud en Revisión';
      mensaje = `Tu solicitud "${solicitud.practica_titulo}" está siendo revisada.`;
      tipo = 'warning';
    }

    console.log('   Título:', titulo);
    console.log('   Mensaje:', mensaje);
    console.log('   Tipo:', tipo);

    if (mensaje) {
      if (permissionStatus === 'granted') {
        console.log('📱 Enviando notificación push...');
        sendLocalNotification(titulo, mensaje, {
          solicitudId: solicitud.id_solicitud,
          tipo: tipo
        });
      } else {
        console.log('🚫 Permisos no otorgados, no se envía notificación push');
      }

      console.log('💾 Guardando en historial...');
      agregarNotificacionAlHistorial(solicitud, tipo, mensaje);
      console.log('✅ Notificación procesada correctamente');
    } else {
      console.log('❌ No se generó mensaje, no se muestra notificación');
    }
  };

  const iniciarPolling = () => {
    console.log('🚀 Intentando iniciar polling...');
    console.log('   isPolling:', isPolling);
    console.log('   isUserInHome:', isUserInHome);
    console.log('   docente:', !!docente?.id_docente);
    
    if (isPolling) {
      console.log('⏭️ Polling ya está activo, no se inicia');
      return null;
    }
    
    if (!isUserInHome) {
      console.log('⏭️ Usuario no está en Home, no se inicia polling');
      return null;
    }
    
    console.log('✅ Iniciando polling...');
    setIsPolling(true);
    
    // Cargar solicitudes inmediatamente
    cargarSolicitudes();
    
    // Configurar intervalo para cada 10 segundos
    const interval = setInterval(() => {
      if (isUserInHome) {
        console.log('⏰ Intervalo de polling ejecutado');
        cargarSolicitudes();
      } else {
        console.log('⏭️ Usuario no está en Home, saltando polling');
      }
    }, 10000);
    
    return interval;
  };

  const detenerPolling = (interval) => {
    if (interval) {
      clearInterval(interval);
    }
    setIsPolling(false);
  };

  const setUserInHome = (inHome) => {
    setIsUserInHome(inHome);
    
    if (inHome && docente?.id_docente && !isPolling) {
      iniciarPolling();
    } else if (!inHome && isPolling) {
      detenerPolling(null);
    }
  };

  useEffect(() => {
    if (docente?.id_docente) {
      cargarNotificacionesGuardadas();
      checkNotificationPermissions();
      setupNotifications();
      
      // Solo iniciar polling si el usuario está en Home
      if (isUserInHome) {
        iniciarPolling();
      }
    }
  }, [docente, isUserInHome]);

  const actualizarManual = () => {
    cargarSolicitudes();
  };

  const closePermissionModal = () => {
    setShowPermissionModal(false);
  };

  const onPermissionGranted = () => {
    setPermissionStatus('granted');
    setShowPermissionModal(false);
  };

  const limpiarSolicitudesNotificadas = async () => {
    if (!docente?.id_docente) return;
    
    try {
      await AsyncStorage.removeItem(`ultimos_estados_${docente.id_docente}`);
      await AsyncStorage.removeItem(`notificaciones_${docente.id_docente}`);
      ultimosEstadosRef.current = new Map();
      setNotificacionesGuardadas([]);
      console.log('🧹 Estado completamente limpiado');
    } catch (error) {
      console.log('Error al limpiar últimos estados:', error);
    }
  };

  const reiniciarSistemaNotificaciones = async () => {
    console.log('🔄 Reiniciando sistema de notificaciones...');
    await limpiarSolicitudesNotificadas();
    
    // Poblar el Map con los estados actuales para evitar notificaciones falsas
    if (solicitudes.length > 0) {
      console.log('📋 Poblando Map con estados actuales...');
      solicitudes.forEach(solicitud => {
        ultimosEstadosRef.current.set(solicitud.id_solicitud, solicitud.estado);
      });
      await guardarUltimosEstados(ultimosEstadosRef.current);
      console.log('✅ Map poblado con', solicitudes.length, 'solicitudes');
    }
    
    await cargarNotificacionesGuardadas();
    console.log('✅ Sistema reiniciado');
  };

  const agregarNotificacionAlHistorial = async (solicitud, tipo, mensaje) => {
    const nuevaNotificacion = {
      id: Date.now(),
      solicitudId: solicitud.id_solicitud,
      titulo: solicitud.practica_titulo,
      mensaje: mensaje,
      tipo: tipo,
      fecha: new Date().toISOString(),
      leida: false,
      estadoAnterior: solicitud.estado
    };

    const notificacionesActualizadas = [nuevaNotificacion, ...notificacionesGuardadas];
    await guardarNotificaciones(notificacionesActualizadas);
  };

  const cargarSolicitudes = async () => {
    if (!docente?.id_docente) return;
    
    console.log('🔄 Cargando solicitudes...', new Date().toLocaleTimeString());
    
    try {
      const response = await axios.get(
        `https://universidad-la9h.onrender.com/solicitudes-uso?id_docente=${docente.id_docente}`
      );
      
      const nuevasSolicitudes = response.data;
      console.log('📊 Solicitudes obtenidas:', nuevasSolicitudes.length);
      
      if (solicitudes.length > 0) {
        console.log('🔍 Iniciando detección de cambios...');
        detectarCambios(solicitudes, nuevasSolicitudes);
      } else {
        console.log('🆕 Primera carga, no hay solicitudes anteriores para comparar');
      }
      
      setSolicitudes(nuevasSolicitudes);
      setLastUpdate(new Date());
      console.log('✅ Solicitudes actualizadas');
    } catch (error) {
      console.log('❌ Error al cargar solicitudes:', error);
    }
  };

  const probarNotificacion = () => {
    console.log('🧪 Probando notificación...');
    const solicitudPrueba = {
      id_solicitud: 999,
      practica_titulo: 'PRUEBA DE NOTIFICACIÓN',
      estado: 'Aprobada'
    };
    mostrarNotificacionCambioEstado(solicitudPrueba, 'Pendiente');
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        solicitudes, 
        lastUpdate, 
        isPolling, 
        notificacionesGuardadas,
        showPermissionModal,
        permissionStatus,
        cargarSolicitudes: actualizarManual,
        iniciarPolling,
        detenerPolling,
        guardarNotificaciones,
        guardarUltimosEstados,
        cargarNotificacionesGuardadas,
        limpiarSolicitudesNotificadas,
        closePermissionModal,
        onPermissionGranted,
        checkNotificationPermissions,
        setUserInHome,
        reiniciarSistemaNotificaciones,
        probarNotificacion
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 