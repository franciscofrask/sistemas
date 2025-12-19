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
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFuncionalidades } from "@/hooks/useFuncionalidades";

const Sidebar = () => {
  const pathname = usePathname();
  const { loading, mapearAMenuItems } = useFuncionalidades();

  // Mapeo de iconos por nombre
  const iconMap = {
    IconLayoutDashboard,
    IconUsers,
    IconTruck,
    IconFileText,
    IconShoppingCart,
    IconStack,
    IconBuildingWarehouse,
    IconShield,
  };

  // Convertir funcionalidades a elementos de menú (ya incluye Dashboard si tiene permisos)
  const allMenuItems = mapearAMenuItems().map(item => ({
    ...item,
    icon: iconMap[item.icon] || IconSettings
  }));

  const isActive = (path) => pathname === path;

  return (
    <Flex direction="column" justify="space-between" h="100%">
      {/* Indicador de carga */}
      <LoadingOverlay visible={loading} />
      
      {/* Menú principal */}
      <div>
        {allMenuItems.map((item) => {
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
              active={isParentActive}
              defaultOpened={isChildActive}
              styles={{
                root: {
                  backgroundColor: isParentActive
                    ? "#EE0E0F"
                    : "transparent",
                  color: "white",
                  transition: "background-color 0.2s ease, color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#EE0E0F",
                    color: "white",
                  },
                },
                label: { color: "inherit" },
                icon: { color: "inherit" },
              }}
            >
              {item.children?.map((child) => (
                <NavLink
                  key={child.label}
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
                        ? "#EE0E0F"
                        : "transparent",
                      color: "white",
                      paddingLeft: 32,
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
              ))}
            </NavLink>
          );
        })}
        <Divider variant="dashed" my="sm" color="#EE0E0F" />
      </div>

      {/* Footer */}
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
    </Flex>
  );
};

export default Sidebar;
