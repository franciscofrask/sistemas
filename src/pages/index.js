
import { Button, Title } from "@mantine/core";
import Link from "next/link";


export default function Home() {
  return (
    <>
      
    <Title order={1}>
        Sitemas
    </Title>

     <Link href="/stock">
       <Button >
        Get Started
      </Button>
     </Link>
    </>
  );
}
