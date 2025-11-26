import React from 'react';
import { Container, Alert, Button, Stack, Text, Center, Loader } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconWifi, IconServerOff } from '@tabler/icons-react';

// Componente para mostrar estados de error de forma visual
export const ErrorDisplay = ({ error, onRetry, isLoading = false, title }) => {
  if (isLoading) {
    return (
      <Center style={{ minHeight: 200 }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">Cargando...</Text>
        </Stack>
      </Center>
    );
  }

  if (!error) return null;

  // Determinar el tipo de error y el icono
  const getErrorInfo = (error) => {
    if (error?.isNetworkError || error?.message?.includes('conexión')) {
      return {
        icon: IconWifi,
        color: 'orange',
        title: 'Error de Conexión',
        suggestion: 'Verifique su conexión a internet y vuelva a intentar.'
      };
    }
    
    if (error?.status === 500 || error?.message?.includes('servidor')) {
      return {
        icon: IconServerOff,
        color: 'red',
        title: 'Error del Servidor',
        suggestion: 'El servicio no está disponible temporalmente. Intente más tarde.'
      };
    }
    
    if (error?.status === 404) {
      return {
        icon: IconAlertTriangle,
        color: 'yellow',
        title: 'Recurso No Encontrado',
        suggestion: 'El recurso solicitado no existe o fue movido.'
      };
    }

    return {
      icon: IconAlertTriangle,
      color: 'red',
      title: title || 'Error',
      suggestion: 'Ha ocurrido un error inesperado. Intente nuevamente.'
    };
  };

  const errorInfo = getErrorInfo(error);
  const Icon = errorInfo.icon;
  const message = error?.message || 'Error desconocido';

  return (
    <Container size="sm" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Alert
        icon={<Icon size={24} />}
        title={errorInfo.title}
        color={errorInfo.color}
        variant="light"
        style={{ padding: '1.5rem' }}
      >
        <Stack gap="md">
          <Text size="sm">
            {message}
          </Text>
          
          <Text size="xs" c="dimmed">
            {errorInfo.suggestion}
          </Text>
          
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              color={errorInfo.color}
              leftSection={<IconRefresh size={16} />}
              onClick={onRetry}
              style={{ alignSelf: 'flex-start' }}
            >
              Reintentar
            </Button>
          )}
        </Stack>
      </Alert>
    </Container>
  );
};

// Componente wrapper para datos con manejo de errores
export const DataWrapper = ({ 
  children, 
  data, 
  loading, 
  error, 
  onRetry, 
  emptyMessage = "No hay datos disponibles",
  errorTitle 
}) => {
  if (loading) {
    return (
      <Center style={{ minHeight: 200 }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">Cargando datos...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} title={errorTitle} />;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Center style={{ minHeight: 200 }}>
        <Text size="lg" c="dimmed">{emptyMessage}</Text>
      </Center>
    );
  }

  return children;
};

export default ErrorDisplay;