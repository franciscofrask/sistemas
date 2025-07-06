import "@/styles/globals.css";
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
// ‼️ import notifications styles after core package styles
import '@mantine/notifications/styles.css';

export default function App({ Component, pageProps }) {

  return(
     <MantineProvider>
       <Notifications />
      <Component {...pageProps} />
      </MantineProvider>
  )
 
}
