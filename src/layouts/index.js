"use client";
import React, { useEffect, useState } from "react";
import {
  AppShell,
  Container,
  Group,
  UnstyledButton,
  Image,
 
  Box,
  Breadcrumbs,
  Anchor,
  Text,
  Loader,
  Center,
  Menu,
  Avatar,

  Select,
  ActionIcon,
} from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
  IconChevronLeft,

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
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(false);
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
    console.log('Cargando almacenes...');
    setLoadingAlmacenes(true);
    
    try {
      const response = await fetch('/api/stock/almacenes?solo_activos=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Respuesta de API almacenes:', result);
      
      if (response.ok && result.success) {
        setAlmacenes(result.data || []);
        console.log('Almacenes cargados:', result.data);
        
        // Verificar si hay un almacén guardado en localStorage
        const almacenGuardado = localStorage.getItem('almacen_seleccionado');
        console.log('Almacén guardado en localStorage:', almacenGuardado);
        
        if (almacenGuardado) {
          try {
            const almacen = JSON.parse(almacenGuardado);
            // Verificar que el almacén aún existe en la lista
            const almacenExiste = result.data.find(a => a.id === almacen.id);
            if (almacenExiste) {
              console.log('Restaurando almacén:', almacen);
              setAlmacenSeleccionado(almacen);
            } else {
              console.log('El almacén guardado ya no existe, limpiando localStorage');
              localStorage.removeItem('almacen_seleccionado');
            }
          } catch (error) {
            console.error('Error parseando almacén guardado:', error);
            localStorage.removeItem('almacen_seleccionado');
          }
        }
      } else {
        console.error('Error en respuesta de API:', result);
      }
    } catch (error) {
      console.error('Error al cargar almacenes:', error);
    }
    setLoadingAlmacenes(false);
  };

  // Función para seleccionar almacén
  const seleccionarAlmacen = (almacenId) => {
    console.log('Seleccionando almacén:', almacenId);
    console.log('Almacenes disponibles:', almacenes);
    
    if (!almacenId) {
      // Deseleccionar almacén
      console.log('Deseleccionando almacén');
      setAlmacenSeleccionado(null);
      localStorage.removeItem('almacen_seleccionado');
    } else {
      // Buscar el almacén en la lista
      const almacen = almacenes.find(a => a.id.toString() === almacenId.toString());
      console.log('Almacén encontrado:', almacen);
      
      if (almacen) {
        setAlmacenSeleccionado(almacen);
        localStorage.setItem('almacen_seleccionado', JSON.stringify(almacen));
        console.log('Almacén guardado en localStorage:', almacen);
      } else {
        console.warn('No se encontró el almacén con ID:', almacenId);
      }
    }
  };

  // Cargar almacenes cuando el componente se monte
  useEffect(() => {
    if (status === "authenticated") {
      cargarAlmacenes();
    }
  }, [status]);

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
        width: desktopOpened ? 250 : 70,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      style={{ position: 'relative' }}
    >
      {/* Flecha para expandir/contraer sidebar */}
      <ActionIcon
        onClick={toggleDesktop}
        style={{
          position: 'fixed',
          top: '50%',
          left: desktopOpened ? 250 : 70,
          transform: 'translateY(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(238, 14, 15, 0.1)',
          color: 'rgba(238, 14, 15, 0.6)',
          border: '1px solid rgba(238, 14, 15, 0.2)',
          borderRadius: desktopOpened ? '0 8px 8px 0' : '0 8px 8px 0',
          borderRight: desktopOpened ? 'none' : '1px solid rgba(238, 14, 15, 0.2)',
          borderLeft: desktopOpened ? '1px solid rgba(238, 14, 15, 0.2)' : 'none',
          padding: '8px 4px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(238, 14, 15, 0.2)';
          e.target.style.color = 'rgba(238, 14, 15, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(238, 14, 15, 0.1)';
          e.target.style.color = 'rgba(238, 14, 15, 0.6)';
        }}
        variant="transparent"
        size="sm"
      >
        {desktopOpened ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
      </ActionIcon>
      {/* Header */}
      <AppShell.Header bg={"#140D0D"} style={{ borderBottom: 'none' }}>
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
      <AppShell.Navbar 
        p={desktopOpened ? "xs" : "4"} 
        pt={0} 
        bg={"#140D0D"}
      >
        <Sidebar collapsed={!desktopOpened} />
      </AppShell.Navbar>

      {/* Contenido principal */}
      <AppShell.Main
        style={{
          overflowX: 'auto',
        }}
      >
        <Container fluid style={{ minWidth: 'max-content' }}>
          {breadcrumbs}
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
