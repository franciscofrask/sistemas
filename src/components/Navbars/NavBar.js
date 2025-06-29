import React from "react";
import {
  Group,
  UnstyledButton,
  Image,
  Flex,
  Title,
} from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

export function NavbarSuperior({ toggleDesktop, toggleMobile, desktopOpened, mobileOpened }) {
  return (
    <Group justify="space-between" h="100%" px="md">
      <Group>
        <UnstyledButton visibleFrom="sm" onClick={toggleDesktop}>
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

        <Image
          src="/logos/logoheader.png"
          alt="Logo"
          h={50}
          w="auto"
          fit="contain"
        />
      </Group>

      <Flex align="center" gap="sm">
        <Title order={5}>Usuario</Title>
        {/* Acá podrías poner avatar, notificaciones, etc */}
      </Flex>
    </Group>
  );
}
