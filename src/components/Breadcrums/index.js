"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs, Anchor } from "@mantine/core";
import Link from "next/link";

export default function BreadcrumbsNav({
  items = null,
  separator = "›",
  separatorColor = "white",
  currentColor = "#EE0E0F",
}) {
  const pathname = usePathname();

  const pathItems = pathname
    .split("/")
    .filter((part) => part)
    .map((segment, index, arr) => {
      const href = "/" + arr.slice(0, index + 1).join("/");
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        href,
      };
    });

  const breadcrumbItems = items || pathItems;

  const breadcrumbs = breadcrumbItems.map((item, index) => {
    const isLast = index === breadcrumbItems.length - 1;

    if (isLast) {
      return (
       <Anchor
  key={index}
  className="breadcrumb-last"
>
  {item.title}
</Anchor>
      );
    }

    return (
     <Anchor
  key={index}
  style={{
    color: `#EE0E0F !important`,
    fontWeight: 600,
    cursor: "default",
    textDecoration: "none",
  }}
>


        {item.title}
        {console.log(currentColor)}
      </Anchor>
    );
  });

  return (
    <Breadcrumbs
      separator={separator}
      separatorMargin="sm"
      mt="sm"
      styles={{
        separator: {
          color: "#EE0E0F",
        },
      }}
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
}
