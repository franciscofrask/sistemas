"use client";
import React, { useState } from "react";
import { NavLink, Text, Tooltip } from "@mantine/core";
import { usePathname } from "next/navigation";
import { IconCornerDownRight } from "@tabler/icons-react";

const mockData = [
  {
    id: 1,
    label: "Dashboard",
    icon: "<svg>...</svg>",
    link: "/dashboard",
    children: [],
  },
  {
    id: 2,
    label: "Inventario",
    icon: "<svg>...</svg>",
    link: "/inventario",
    children: [
      {
        id: 3,
        label: "Productos",
        icon: "<svg>...</svg>",
        link: "/inventario/productos",
        children: [],
      },
      {
        id: 4,
        label: "Categorías",
        icon: "<svg>...</svg>",
        link: "/inventario/categorias",
        children: [],
      },
    ],
  },
];

const Sidebar = () => {
  return (
    <nav className="sideBarMenu">
      {mockData.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </nav>
  );
};

const NavItem = ({ item }) => {
  const { label, icon, link, children } = item;
  if (children && children.length > 0) {
    return <NavItemHeader item={item} />;
  }

  return (
    <NavLink
      href={link}
      label={label}
      leftSection={
        <span
          className="sideBarMenu_navIcon"
          dangerouslySetInnerHTML={{ __html: icon }}
        ></span>
      }
      className="sideBarMenu_navItem"
    />
  );
};

const NavItemHeader = ({ item }) => {
  const { label, icon, link, children } = item;
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(pathname?.includes(link));

  const handleExpand = (e) => {
    e.preventDefault();
    setExpanded((prev) => !prev);
  };

  return (
    <NavLink
      href={link}
      label={label}
      leftSection={
        <span
          className="sideBarMenu_navIcon"
          dangerouslySetInnerHTML={{ __html: icon }}
        ></span>
      }
      onClick={handleExpand}
      defaultOpened={expanded}
      childrenOffset={0}
    >
      <div className="sideBarMenu_navSubItem">
        {children.map((subItem) => (
          subItem.children?.length > 0 ? (
            <NavItemHeader key={subItem.id} item={subItem} />
          ) : (
            <NavLink
              key={subItem.id}
              href={subItem.link}
              label={
                <Tooltip label={subItem.label} position="right">
                  <Text truncate="end">{subItem.label}</Text>
                </Tooltip>
              }
              leftSection={
                <>
                  <IconCornerDownRight className="sideBarMenu_navIconx" />
                  <span
                    className="sideBarMenu_navIcon"
                    dangerouslySetInnerHTML={{ __html: subItem.icon }}
                  ></span>
                </>
              }
              className={`sideBarMenu_navItem ${
                pathname === subItem.link && "sideBarMenu_navItemActivo"
              }`}
            />
          )
        ))}
      </div>
    </NavLink>
  );
};

export default Sidebar;
