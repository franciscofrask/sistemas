"use client";
import React from "react";
import {
  AppShell,
  Container,
  Group,
  UnstyledButton,
  Image,
  Flex,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import Sidebar from "@/components/Navbars/SideBar"; // Ajustá la ruta si es necesario
import Link from "next/link";

export function LayoutBase({ children }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
     
      header={{ height: 71, bg: "green" }}
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
      <UnstyledButton  visibleFrom="sm"  c={"white"} onClick={toggleDesktop}>
        {desktopOpened ? (
          <IconLayoutSidebarLeftCollapse  />
        ) : (
          <IconLayoutSidebarLeftExpand />
        )}
      </UnstyledButton>

      <UnstyledButton hiddenFrom="sm"  onClick={toggleMobile}>
        {mobileOpened ? (
          <IconLayoutSidebarLeftCollapse />
        ) : (
          <IconLayoutSidebarLeftExpand />
        )}
      </UnstyledButton>

      {/* Separador */}
      <Box
        h={30}
        w={1}
        mx="sm"
        bg="gray.4"
        style={{ alignSelf: "center" }}
        
      />

      <Link href="/">
        <Image
          src="/logos/logo.png"
          h={70}
          w="auto"
        />
      </Link>
    </Group>

          {/* Aquí podés agregar botones de usuario, íconos, etc. */}
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar p="xs"  bg={"#140D0D"} >
      <Sidebar />
      </AppShell.Navbar>

      {/* Contenido principal */}
      <AppShell.Main >
        <Container fluid >{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
