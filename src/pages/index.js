"use client";
import { Title } from "@mantine/core";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutBase } from "@/layouts";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/stock/dashboard");
    }
  }, [router, status]);

  return (
    <LayoutBase>
      <Title order={1}>Cargando Sistema...</Title>
    </LayoutBase>
  );
}
