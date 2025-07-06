"use client";
import { NavLink, Divider, Tooltip, Text, Flex, Group, ActionIcon } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconTruck,
  IconFileText,
  IconShoppingCart,
  IconBrandFacebook, IconBrandInstagram,
  IconStack,
  IconBuildingWarehouse 
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    icon: IconLayoutDashboard,
    path: "/stock/dashboard",
  },
  {
    label: "Inventario",
    icon: IconStack,
    path: "/stock/inventario",
  },
  {
    label: "Almacenes",
    icon: IconBuildingWarehouse,
    path: "/stock/almacenes",
  },
  {
    label: "Proveedores",
    icon: IconTruck,
    path: "/stock/proveedores",
  },
   {
    label: "Clientes",
    icon: IconUsers,
    path: "/stock/clientes",
  },
  {
    label: "Presupuestos",
    icon: IconFileText,
    path: "/stock/presupuestos",
  },
  {
    label: "Comercio",
    icon: IconShoppingCart,
    children: [
      {
        label: "Ventas",
        path: "/stock/ventas",
      },
    ],
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <Flex direction="column" justify="space-between" h="100%">
    {/* Sección principal del menú */}
    <div>
      {menuItems.map((item) => (
        <NavLink
          key={item.label}
          label={item.label}
          component={item.path ? Link : undefined}
          href={item.path}
          leftSection={item.icon ? <item.icon size={18} /> : null}
          active={isActive(item.path)}
          defaultOpened={item.children?.some((child) => isActive(child.path))}
          styles={{
            root: {
              backgroundColor: isActive(item.path) ? "#EE0E0F" : "transparent",
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
                  <Text truncate="end">{child.label}</Text>
                </Tooltip>
              }
              active={isActive(child.path)}
              styles={{
                root: {
                  backgroundColor: "transparent",
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
            />
          ))}
        </NavLink>
      ))}

      <Divider variant="dashed" my="sm" color="#EE0E0F" />
    </div>

    {/* Footer inferior dentro del sidebar */}
    <Flex direction="column" gap="xs" align="center" mt="sm" p="xs">
      <Text c="gray.4" size="xs" ta="center">
        © {new Date().getFullYear()} Francsico Frasconá
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
