"use client";
import React, { useEffect, useState } from "react";
import {
  AppShell,
  Container,
  Group,
  UnstyledButton,
  Image,
  Flex,
  Box,
  Breadcrumbs,
  Anchor,
  Text,
  Loader,
  Center,
  Menu,
  Avatar,
  Divider,
  Select,
} from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconBuildingWarehouse,
  IconCheck,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useStableSession } from "@/hooks/useStableSession";
import Sidebar from "@/components/Navbars/SideBar";
import Link from "next/link";

// Capitaliza y reemplaza guiones
const formatSegment = (segment) =>
  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

export function LayoutBase({ children }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useStableSession();
  
  // Estados para almacenes
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState(null);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // Hook para manejo global de errores
  useErrorHandler();

  // Verificar autenticación al cargar el layout
  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirigir al login si no está autenticado
      router.push("/autenticacion/ingresar");
    }
  }, [status, router]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      // Limpiar almacén seleccionado al cerrar sesión
      localStorage.removeItem('almacen_seleccionado');
      await signOut({ 
        callbackUrl: '/autenticacion/ingresar',
        redirect: true 
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Fallback: redirigir manualmente
      router.push('/autenticacion/ingresar');
    }
  };

  // Cargar almacenes disponibles (solo activos para el menú)
  const cargarAlmacenes = async () => {
    if (!session?.user?.token) return;
    
    setLoadingAlmacenes(true);
    try {
      const response = await fetch('/api/stock/almacenes?solo_activos=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        }
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setAlmacenes(result.data || []);
        
        // Verificar si hay un almacén guardado en localStorage
        const almacenGuardado = localStorage.getItem('almacen_seleccionado');
        if (almacenGuardado) {
          try {
            const almacen = JSON.parse(almacenGuardado);
            // Verificar que el almacén aún existe en la lista
            const almacenExiste = result.data.find(a => a.id === almacen.id);
            if (almacenExiste) {
              setAlmacenSeleccionado(almacen);
            } else {
              // Si no existe, limpiar localStorage
              localStorage.removeItem('almacen_seleccionado');
            }
          } catch (error) {
            // Si hay error parseando, limpiar localStorage
            localStorage.removeItem('almacen_seleccionado');
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
    setLoadingAlmacenes(false);
  };

  // Función para seleccionar almacén
  const seleccionarAlmacen = (almacenId) => {
    if (!almacenId) {
      // Deseleccionar almacén
      setAlmacenSeleccionado(null);
      localStorage.removeItem('almacen_seleccionado');
    } else {
      // Buscar el almacén en la lista
      const almacen = almacenes.find(a => a.id.toString() === almacenId.toString());
      if (almacen) {
        setAlmacenSeleccionado(almacen);
        localStorage.setItem('almacen_seleccionado', JSON.stringify(almacen));
      }
    }
  };

  // Cargar almacenes cuando la sesión esté lista
  useEffect(() => {
    if (session?.user?.token) {
      cargarAlmacenes();
    }
  }, [session]);

  // Mostrar loader mientras verifica la sesión
  if (status === "loading") {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
        <Text ml="md">Cargando...</Text>
      </Center>
    );
  }

  // No renderizar nada si no está autenticado (evita flash de contenido)
  if (status === "unauthenticated") {
    return null;
  }

  // Limpiar y dividir ruta
  const segments = pathname
    .replace(/^\/|\/$/g, "") // remueve barras inicial/final
    .split("/")
    .filter(Boolean);

  const breadcrumbItems = [
    { title: "Inicio", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      return { title: formatSegment(segment), href };
    }),
  ];

  const breadcrumbs = (
    <Breadcrumbs separator="/" mt="md" mb="lg">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return isLast ? (
          <Text
          td={"underline"}
          c={"#EE0E0F"}
          fw={600}
  key={index}

>
  {item.title}
</Text>

        ) : (
          <Anchor
            key={index}
            href={item.href}
            style={{
              color: "white",
              textTransform: "capitalize",
            }}
          >
            {item.title}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );

  return (
    <AppShell
      header={{ height: 71 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      {/* Header */}
      <AppShell.Header bg={"#140D0D"}>
        <Group justify="space-between" h="100%" px="md">
          <Group>
            <UnstyledButton visibleFrom="sm" c={"white"} onClick={toggleDesktop}>
              {desktopOpened ? (
                <IconLayoutSidebarLeftCollapse />
              ) : (
                <IconLayoutSidebarLeftExpand />
              )}
            </UnstyledButton>

            <UnstyledButton hiddenFrom="sm" onClick={toggleMobile}>
              {mobileOpened ? (
                <IconLayoutSidebarLeftCollapse />
              ) : (
                <IconLayoutSidebarLeftExpand />
              )}
            </UnstyledButton>

            {/* Separador */}
            <Box h={30} w={1} mx="sm" bg="gray.4" />

            <Link href="/">
              <Image src="/logos/logo.png" h={70} w="auto" />
            </Link>
          </Group>

          {/* Información del usuario */}
          <Menu shadow="md" width={220} position="bottom-end" withArrow>
            <Menu.Target>
              <UnstyledButton
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'transparent';
                }}
              >
                <Group gap="sm">
                  <Avatar 
                    color="#EE0E0F" 
                    size="sm" 
                    variant="filled"
                    style={{
                      background: 'linear-gradient(45deg, #EE0E0F, #FF4444)'
                    }}
                  >
                    <IconUser size={16} />
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <Text size="sm" c="white" fw={500} truncate>
                      {session?.user?.nombre?.split(' ')[0] || 'Usuario'}
                    </Text>
                    <Text size="xs" c="gray.4" truncate>
                      {almacenSeleccionado ? `📦 ${almacenSeleccionado.nombre}` : 'Sin almacén seleccionado'}
                    </Text>
                  </div>
                  <IconChevronDown size={14} color="rgba(255, 255, 255, 0.7)" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                <Text size="xs" fw={600} c="dimmed">
                  Mi cuenta
                </Text>
              </Menu.Label>
              
              <Menu.Item 
                leftSection={<IconUser size={14} />}
                disabled
                style={{ color: 'gray' }}
              >
                <div>
                  <Text size="sm">Perfil de usuario</Text>
                  <Text size="xs" c="dimmed">Próximamente</Text>
                </div>
              </Menu.Item>
              
              <Menu.Item 
                leftSection={<IconSettings size={14} />}
                disabled
                style={{ color: 'gray' }}
              >
                <div>
                  <Text size="sm">Configuración</Text>
                  <Text size="xs" c="dimmed">Próximamente</Text>
                </div>
              </Menu.Item>
              
              <Menu.Divider />
              
              {/* Sección de selección de almacén */}
              <Menu.Label>
                <Text size="xs" fw={600} c="dimmed">
                  Almacén de trabajo
                </Text>
              </Menu.Label>
              
              <Menu.Item closeMenuOnClick={false}>
                <Select
                  placeholder="Seleccionar almacén..."
                  value={almacenSeleccionado?.id?.toString() || null}
                  onChange={seleccionarAlmacen}
                  data={almacenes.map(almacen => ({
                    value: almacen.id.toString(),
                    label: almacen.nombre,
                    description: almacen.direccion || 'Sin dirección'
                  }))}
                  clearable
                  disabled={loadingAlmacenes}
                  size="sm"
                  style={{ width: '100%' }}
                  searchable
                  nothingFoundMessage="No hay almacenes disponibles"
                />
              </Menu.Item>
              
              <Menu.Divider />
              
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={handleLogout}
                style={{
                  '&:hover': {
                    backgroundColor: 'rgba(238, 14, 15, 0.1)'
                  }
                }}
              >
                <Text size="sm" fw={500}>Cerrar sesión</Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar p="xs" bg={"#140D0D"}>
        <Sidebar />
      </AppShell.Navbar>

      {/* Contenido principal */}
      <AppShell.Main>
        <Container fluid>
          {breadcrumbs}
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
