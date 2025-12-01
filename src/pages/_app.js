import "@/styles/globals.css";
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
// ‼️ import notifications styles after core package styles
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }) {

  return(
     <MantineProvider>
       <Notifications />
       <ErrorBoundary>
         <SessionProvider 
           session={pageProps.session}
           refetchInterval={0}
           refetchOnWindowFocus={false}
           refetchWhenOffline={false}
         >
           <Component {...pageProps} />
         </SessionProvider>
       </ErrorBoundary>
      </MantineProvider>
  )
 
}
