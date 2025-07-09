"use client";
import React from "react";
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
} from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Navbars/SideBar";
import Link from "next/link";

// Capitaliza y reemplaza guiones
const formatSegment = (segment) =>
  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

export function LayoutBase({ children }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const pathname = usePathname();

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
          bold
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
