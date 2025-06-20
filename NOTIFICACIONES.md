# Sistema de Notificaciones - AppDocentes

## Descripción General

Se ha implementado un sistema completo de notificaciones en tiempo real que actualiza automáticamente el estado de las solicitudes cada 10 segundos y muestra notificaciones elegantes cuando hay cambios. **Incluye una pantalla dedicada para ver el historial de notificaciones y un sistema de permisos para notificaciones push.**

## Características Implementadas

### 1. Polling Automático
- **Frecuencia**: Cada 10 segundos
- **Activación**: Automática cuando el usuario está logueado
- **Desactivación**: Automática al cerrar sesión o cambiar de usuario

### 2. Detección de Cambios
- Compara el estado actual con el anterior de cada solicitud
- Detecta cambios de estado: Pendiente → Aprobada/Rechazada
- Solo muestra notificaciones cuando hay cambios reales

### 3. Notificaciones Visuales
- **Toast Notifications**: Notificaciones elegantes que aparecen en la parte superior
- **Notificaciones Push**: Notificaciones nativas del sistema operativo
- **Tipos de notificación**:
  - ✅ **Success**: Solicitudes aprobadas (verde)
  - ❌ **Error**: Solicitudes rechazadas (rojo)
  - ⚠️ **Warning**: Solicitudes en revisión (amarillo)
  - ℹ️ **Info**: Información general (azul)

### 4. Sistema de Permisos
- **Modal de permisos**: Solicita permisos de notificaciones al usuario
- **Persistencia**: Recuerda la decisión del usuario
- **Configuración**: Guía al usuario a la configuración si rechaza
- **Notificaciones push**: Envía notificaciones nativas cuando los permisos están concedidos

### 5. Pantalla de Notificaciones
- **Historial completo**: Todas las notificaciones recibidas
- **Estado de lectura**: Marca notificaciones como leídas/no leídas
- **Gestión**: Eliminar notificaciones individuales o todas
- **Contador**: Badge con número de notificaciones no leídas
- **Navegación**: Acceso desde el menú principal

### 6. Indicadores de Estado
- **Indicador de actualización**: Muestra si el sistema está actualizando
- **Última actualización**: Muestra cuándo fue la última actualización
- **Pull-to-refresh**: Actualización manual deslizando hacia abajo

## Componentes Creados

### 1. NotificationContext (`context/NotificationContext.js`)
```javascript
// Funcionalidades principales:
- Polling automático cada 10 segundos
- Detección de cambios en solicitudes
- Gestión de notificaciones
- Estado de actualización
- Almacenamiento local con AsyncStorage
- Manejo de permisos de notificaciones
- Envío de notificaciones push locales
```

### 2. NotificationToast (`components/NotificationToast.js`)
```javascript
// Características:
- Animaciones suaves de entrada/salida
- Auto-cierre después de 5 segundos
- Diferentes tipos visuales según el estado
- Botón de cierre manual
```

### 3. LastUpdateIndicator (`components/LastUpdateIndicator.js`)
```javascript
// Funcionalidades:
- Muestra tiempo desde última actualización
- Indicador visual de estado de actualización
- Formato de tiempo relativo (ej: "Hace 2m 30s")
```

### 4. NotificationPermissions (`components/NotificationPermissions.js`)
```javascript
// Funcionalidades:
- Modal elegante para solicitar permisos
- Explicación de beneficios de las notificaciones
- Manejo de diferentes estados de permisos
- Guía para configuración manual
```

### 5. NotificacionesScreen (`screens/NotificacionesScreen.js`)
```javascript
// Funcionalidades:
- Historial completo de notificaciones
- Gestión de estado de lectura
- Eliminación individual y masiva
- Interfaz elegante y responsive
```

## Cómo Funciona

### Flujo de Notificaciones
1. **Inicio**: Al loguearse, se inicia el polling automático
2. **Permisos**: Se solicita permiso para notificaciones (primera vez)
3. **Polling**: Cada 10 segundos se consulta la API
4. **Comparación**: Se comparan las solicitudes nuevas con las anteriores
5. **Detección**: Si hay cambios de estado, se genera una notificación
6. **Visualización**: Se muestra el toast y notificación push (si hay permisos)
7. **Almacenamiento**: La notificación se guarda en el historial local

### Estados de Solicitud
- **Pendiente**: Solicitud enviada, en espera de revisión
- **Aprobada**: Solicitud aprobada por el administrador
- **Rechazada**: Solicitud rechazada por el administrador

### Navegación
- **Menú principal**: Botón "Notificaciones" con badge de contador
- **Pantalla de notificaciones**: Historial completo con gestión
- **Volver**: Botón de regreso a la pantalla principal

### Sistema de Permisos
1. **Primera vez**: Modal explicativo con beneficios
2. **Permitir**: Habilita notificaciones push nativas
3. **Rechazar**: Solo notificaciones toast internas
4. **Configuración**: Guía para habilitar manualmente

## Configuración

### Intervalo de Actualización
Para cambiar el intervalo de actualización, modifica esta línea en `NotificationContext.js`:
```javascript
}, 10000); // Cambiar 10000 por el tiempo deseado en milisegundos
```

### Duración de Notificaciones
Para cambiar cuánto tiempo se muestran las notificaciones, modifica en `HomeScreen.js`:
```javascript
duration={5000} // Cambiar 5000 por el tiempo deseado en milisegundos
```

### Permisos de Notificaciones
El sistema maneja automáticamente los permisos, pero puedes configurar:
```javascript
// En NotificationContext.js
const setupNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};
```

## Uso de la Aplicación

### Acceso a Notificaciones
1. **Abrir menú**: Toca el botón de menú en la parte inferior
2. **Ver contador**: El badge rojo muestra notificaciones no leídas
3. **Acceder**: Toca "Notificaciones" para ver el historial

### Gestión de Notificaciones
1. **Marcar como leída**: Toca una notificación para marcarla como leída
2. **Eliminar individual**: Toca el botón "X" en cada notificación
3. **Eliminar todas**: Toca el botón de papelera en el header

### Permisos de Notificaciones
1. **Primera vez**: Aparece modal explicativo
2. **Permitir**: Recibirás notificaciones push nativas
3. **Rechazar**: Solo notificaciones internas
4. **Cambiar después**: Ve a configuración del dispositivo

## Beneficios

1. **Tiempo Real**: Los usuarios reciben notificaciones inmediatas de cambios
2. **Experiencia de Usuario**: Notificaciones elegantes y no intrusivas
3. **Eficiencia**: No necesitan refrescar manualmente la pantalla
4. **Información Clara**: Saben exactamente qué cambió y cuándo
5. **Rendimiento**: Polling optimizado que no consume muchos recursos
6. **Historial**: Acceso completo al historial de notificaciones
7. **Permisos Inteligentes**: Sistema de permisos respetuoso y explicativo
8. **Notificaciones Push**: Notificaciones nativas del sistema operativo

## Consideraciones Técnicas

- **Batería**: El polling cada 10 segundos tiene un impacto mínimo en la batería
- **Datos**: Las consultas son ligeras y solo obtienen datos necesarios
- **Red**: Manejo de errores de conexión incluido
- **Memoria**: Cleanup automático al cambiar de usuario o cerrar sesión
- **Almacenamiento**: Uso eficiente de AsyncStorage con límites de tamaño
- **Permisos**: Manejo respetuoso de permisos con explicaciones claras

## Dependencias Agregadas

```json
{
  "expo-notifications": "~0.27.6"
}
```

## Próximas Mejoras Posibles

1. **Push Notifications Remotas**: Integrar notificaciones push desde servidor
2. **Sonidos**: Agregar sonidos personalizados para las notificaciones
3. **Vibración**: Vibración en dispositivos móviles
4. **Configuración**: Permitir al usuario configurar el intervalo de actualización
5. **Filtros**: Notificaciones solo para ciertos tipos de cambios
6. **Exportar**: Función para exportar historial de notificaciones
7. **Categorías**: Organizar notificaciones por tipo o fecha
8. **Programación**: Notificaciones programadas para recordatorios 