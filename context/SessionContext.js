import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [docente, setDocente] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const data = await AsyncStorage.getItem('docente');
        if (data) {
          setDocente(JSON.parse(data));
        }
      } catch (error) {
        console.log('Error al cargar sesión', error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarSesion();
  }, []);

  const login = async (docenteData) => {
    await AsyncStorage.setItem('docente', JSON.stringify(docenteData));
    setDocente(docenteData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('docente');
    setDocente(null);
  };

  return (
    <SessionContext.Provider value={{ docente, login, logout, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};