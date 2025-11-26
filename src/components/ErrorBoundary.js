import React from 'react';
import { Container, Title, Text, Button, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" style={{ marginTop: '5rem' }}>
          <Stack align="center" gap="lg">
            <Alert 
              icon={<IconAlertTriangle size={24} />} 
              title="Error en la aplicación" 
              color="red"
              variant="light"
            >
              <Text size="sm">
                Ha ocurrido un error inesperado. Por favor, recarga la página o contacta al administrador si el problema persiste.
              </Text>
            </Alert>

            <Stack align="center" gap="md">
              <Title order={2} c="red">Oops! Algo salió mal</Title>
              <Text ta="center" c="dimmed">
                La aplicación encontró un error y no puede continuar funcionando correctamente.
              </Text>
              
              <Button 
                variant="outline" 
                color="red"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ marginTop: '1rem', width: '100%' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                    Detalles del error (desarrollo)
                  </summary>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </Stack>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;