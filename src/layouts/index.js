"use client";
import React, { useEffect } from "react";
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
} from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
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
  const { data: session, status } = useSession();

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
                      {session?.usuario?.persona_datos?.split(' ')[0] || 'Usuario'}
                    </Text>
                    <Text size="xs" c="gray.4" truncate>
                      {session?.usuario?.mail || 'admin@sistema.com'}
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
