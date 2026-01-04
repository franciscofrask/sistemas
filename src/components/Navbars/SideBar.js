"use client";
import {
  NavLink,
  Divider,
  Tooltip,
  Text,
  Flex,
  Group,
  ActionIcon,
  LoadingOverlay,
  HoverCard,
  Paper,
  Stack,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconTruck,
  IconFileText,
  IconShoppingCart,
  IconBrandFacebook,
  IconBrandInstagram,
  IconStack,
  IconBuildingWarehouse,
  IconSettings,
  IconShield,
  IconShoppingBag,
  IconReceipt,
  IconPackage,
  IconCash,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFuncionalidades } from "@/hooks/useFuncionalidades";

const Sidebar = ({ collapsed = false }) => {
  const pathname = usePathname();
  const { loading, mapearAMenuItems } = useFuncionalidades();

  // Función para obtener icono dinámicamente
  const getIcon = (iconName) => {
    const iconMap = {
      IconLayoutDashboard,
      IconUsers,
      IconTruck,
      IconFileText,
      IconShoppingCart,
      IconStack,
      IconBuildingWarehouse,
      IconShield,
      IconShoppingBag,
      IconReceipt,
      IconPackage,
      IconCash,
    };

    // Si el icono existe en el mapeo, lo retornamos
    if (iconMap[iconName]) {
      return iconMap[iconName];
    }

    // Mapeo adicional por nombre común (para mayor flexibilidad)
    const nameMapping = {
      'compras': IconShoppingBag,
      'ventas': IconShoppingCart,
      'productos': IconPackage,
      'almacenes': IconBuildingWarehouse,
      'usuarios': IconUsers,
      'dashboard': IconLayoutDashboard,
      'presupuesto': IconReceipt,
      'presupuestos': IconReceipt,
      'comercio': IconShoppingCart,
      'administracion': IconShield,
      'stock': IconStack,
    };

    // Buscar por nombre común (sin importar mayúsculas)
    const normalizedName = iconName?.toString().toLowerCase();
    if (nameMapping[normalizedName]) {
      return nameMapping[normalizedName];
    }

    // Icono por defecto
    return IconSettings;
  };

  // Convertir funcionalidades a elementos de menú (ya incluye Dashboard si tiene permisos)
  const allMenuItems = mapearAMenuItems().map(item => ({
    ...item,
    icon: getIcon(item.icon)
  }));

  const isActive = (path) => pathname === path;

  // Componente para menú hover cuando está colapsado
  const CollapsedMenuItem = ({ item }) => {
    const isParentActive = isActive(item.path);
    const isChildActive = item.children?.some((child) => isActive(child.path));

    if (!item.children || item.children.length === 0) {
      // Item sin hijos
      return (
        <Tooltip label={item.label} position="right" withArrow>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
            <ActionIcon
              component={item.path ? Link : undefined}
              href={item.path}
              size="lg"
              variant={isParentActive ? "filled" : "subtle"}
              color={isParentActive ? "red" : "gray"}
              style={{
                backgroundColor: isParentActive ? "#EE0E0F" : "transparent",
                color: "white",
                "&:hover": {
                  backgroundColor: "#EE0E0F",
                }
              }}
            >
              {item.icon ? <item.icon size={24} /> : null}
            </ActionIcon>
          </div>
        </Tooltip>
      );
    }

    // Item con hijos - usar HoverCard
    return (
      <HoverCard width={160} shadow="md" position="right-start" offset={5} openDelay={200} closeDelay={100}>
        <HoverCard.Target>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
            <ActionIcon
              size="lg"
              variant={(isParentActive || isChildActive) ? "filled" : "subtle"}
              color={(isParentActive || isChildActive) ? "red" : "gray"}
              style={{
                backgroundColor: (isParentActive || isChildActive) ? "#EE0E0F" : "transparent",
                color: "white",
                "&:hover": {
                  backgroundColor: "#EE0E0F",
                }
              }}
            >
              {item.icon ? <item.icon size={24} /> : null}
            </ActionIcon>
          </div>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ backgroundColor: "#2C2E33", border: "1px solid #404040" }}>
          <Paper p="xs" style={{ backgroundColor: "transparent" }}>
            <Text fw={500} mb="xs" c="white" size="xs">
              {item.label}
            </Text>
            <Stack gap={2}>
              {item.children.map((child) => (
                <NavLink
                  key={child.label}
                  component={Link}
                  href={child.path}
                  label={child.label}
                  active={isActive(child.path)}
                  styles={{
                    root: {
                      backgroundColor: isActive(child.path) ? "#EE0E0F" : "transparent",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      minHeight: "auto",
                      "&:hover": {
                        backgroundColor: "#EE0E0F",
                        color: "white",
                      },
                    },
                    label: {
                      color: "inherit",
                      fontSize: "0.75rem",
                      lineHeight: "1.2",
                    },
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </HoverCard.Dropdown>
      </HoverCard>
    );
  };

  return (
    <Flex direction="column" justify="space-between" h="100%" style={{ margin: 0, padding: 0 }}>
      {/* Indicador de carga */}
      <LoadingOverlay visible={loading} />
      
      {/* Menú principal */}
      <div>
        {collapsed ? (
          // Vista colapsada - usar CollapsedMenuItem para hover
          allMenuItems.map((item) => (
            <CollapsedMenuItem key={item.label} item={item} />
          ))
        ) : (
          // Vista expandida - usar NavLink normal
          allMenuItems.map((item) => {
            const isParentActive = isActive(item.path);
            const isChildActive = item.children?.some((child) =>
              isActive(child.path)
            );

            return (
              <NavLink
                key={item.label}
                label={item.label}
                component={item.path ? Link : undefined}
                href={item.path}
                leftSection={item.icon ? <item.icon size={18} /> : null}
                active={isParentActive || isChildActive}
                defaultOpened={isChildActive}
                styles={{
                  root: {
                    backgroundColor: (isParentActive || isChildActive)
                      ? "#EE0E0F"
                      : "transparent",
                    color: "white",
                    borderRadius: "8px",
                    margin: "2px 4px",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#CC0C0D", // Más fuerte que el rojo normal
                      color: "white",
                    },
                  },
                  label: { color: "inherit" },
                  icon: { color: "inherit" },
                }}
              >
                {item.children?.map((child) => (
                  <div key={child.label} style={{ paddingRight: '8px' }}>
                    <NavLink
                      component={Link}
                      href={child.path}
                      label={
                        <Tooltip label={child.label} position="right">
                          <Text size="sm" ml="md" truncate="end">
                            {child.label}
                          </Text>
                        </Tooltip>
                      }
                      active={isActive(child.path)}
                      styles={{
                        root: {
                          backgroundColor: isActive(child.path)
                            ? "rgba(238, 14, 15, 0.3)" // Más transparente para hijos activos
                            : "transparent",
                          color: "white",
                          paddingLeft: 20,
                          borderRadius: "6px",
                          margin: "1px 0px 1px 8px",
                          transition: "background-color 0.2s ease, color 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#EE0E0F",
                            color: "white",
                          },
                        },
                        label: {
                          color: "inherit",
                          fontSize: "0.85rem",
                        },
                        icon: { color: "inherit" },
                      }}
                    />
                  </div>
                ))}
              </NavLink>
            );
          })
        )}
        <Divider variant="dashed" my="sm" color="#EE0E0F" />
      </div>

      {/* Footer */}
      {!collapsed && (
        <Flex direction="column" gap="xs" align="center" mt="sm" p="xs">
          <Text c="gray.4" size="xs" ta="center">
            © {new Date().getFullYear()} Francisco Frasconá
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="transparent"
              color="gray.4"
              component="a"
              href="https://facebook.com"
              target="_blank"
            >
              <IconBrandFacebook size={16} />
            </ActionIcon>
            <ActionIcon
              variant="transparent"
              color="gray.4"
              component="a"
              href="https://instagram.com"
              target="_blank"
            >
              <IconBrandInstagram size={16} />
            </ActionIcon>
          </Group>
        </Flex>
      )}
    </Flex>
  );
};

export default Sidebar;
