"use client";
import { Title } from "@mantine/core";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/stock/inventario");
  }, [router]);

  return (
    <>
      <Title order={1}>Sistemas</Title>

      {/*
      <Link href="/stock/inventario">
        <Button>
          Get Started
        </Button>
      </Link>
      */}
    </>
  );
}
