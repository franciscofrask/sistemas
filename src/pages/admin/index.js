// src/pages/admin/index.js
import React from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import {
  Container,
  Title,
  Grid,
  Card,
  Group,
  Text,
  Button,
  Stack,
  Badge,
  ActionIcon
} from '@mantine/core';
import {
  IconUsers,
  IconSettings,
  IconShield,
  IconDatabase,
  IconChevronRight
} from '@tabler/icons-react';
import { useRouter } from 'next/router';

const AdminPanel = () => {
  const router = useRouter();

  const adminModules = [
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios, roles y permisos del sistema',
      icon: IconUsers,
      route: '/admin/usuarios',
      color: 'blue',
      stats: 'Ver usuarios registrados'
    },
    {
      id: 'permisos',
      title: 'Control de Permisos',
      description: 'Configurar permisos por rol y funcionalidad',
      icon: IconShield,
      route: '/admin/permisos',
      color: 'green',
      stats: 'Configurar accesos'
    },
    {
      id: 'sistema',
      title: 'Configuración del Sistema',
      description: 'Parámetros generales y configuraciones avanzadas',
      icon: IconSettings,
      route: '/admin/sistema',
      color: 'orange',
      stats: 'Configuraciones'
    },
    {
      id: 'database',
      title: 'Base de Datos',
      description: 'Respaldos, mantenimiento y estadísticas de la BD',
      icon: IconDatabase,
      route: '/admin/database',
      color: 'red',
      stats: 'Herramientas DB'
    }
  ];

  const ModuleCard = ({ module }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group>
          <module.icon size={24} color={`var(--mantine-color-${module.color}-6)`} />
          <Text fw={500} size="lg">{module.title}</Text>
        </Group>
        <Badge color={module.color} variant="light">
          Admin
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        {module.description}
      </Text>

      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {module.stats}
        </Text>
        <ActionIcon
          variant="subtle"
          color={module.color}
          onClick={() => router.push(module.route)}
        >
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>
    </Card>
  );

  return (
    <ProtectedLayout>
      <Container size="xl">
        <Stack spacing="xl">
          {/* Header */}
          <div>
            <Title order={1} mb="sm">Panel de Administración</Title>
            <Text size="lg" c="dimmed">
              Gestión y configuración del sistema
            </Text>
          </div>

          {/* Módulos de administración */}
          <Grid>
            {adminModules.map((module) => (
              <Grid.Col key={module.id} span={{ base: 12, sm: 6, lg: 3 }}>
                <ModuleCard module={module} />
              </Grid.Col>
            ))}
          </Grid>

          {/* Información del sistema */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>Información del Sistema</Title>
              <Badge color="teal" variant="light">En línea</Badge>
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" c="dimmed">Versión del Sistema</Text>
                  <Text fw={500}>v1.0.0</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" c="dimmed">Base de Datos</Text>
                  <Text fw={500}>MySQL 8.0</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" c="dimmed">Última Actualización</Text>
                  <Text fw={500}>{new Date().toLocaleDateString('es-AR')}</Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" c="dimmed">Estado del Servidor</Text>
                  <Badge color="green" variant="light">Operativo</Badge>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Stack>
      </Container>
    </ProtectedLayout>
  );
};

export default AdminPanel;