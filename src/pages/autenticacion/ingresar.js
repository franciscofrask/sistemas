import React, { useState } from "react";
import { 
    Button, 
    TextInput, 
    PasswordInput, 
    Title, 
    Box, 
    LoadingOverlay, 
    Container,
    Card,
    Stack,
    Center,
    Image,
    Text,
    Alert,
    Divider
} from "@mantine/core";
import { IconAlertCircle, IconLock, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import * as jwt from "jose";

function Login() {
    const router = useRouter();
    const [buscando, setBuscando] = useState(false);
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const callbackUrl = router.query?.callbackUrl ?? "/stock/dashboard";

    const Login = async () => {
        setBuscando(true);
        setErrorMessage("");
        
        // Generar token frontend
        const token = await new jwt.SignJWT({})
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1m')
            .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_FRONT_JWT));

        try {
            // Llamar a la API de login (enviamos contraseña en texto plano para bcrypt)
            const response = await fetch("/api/usuarios/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    usuario: usuario,
                    clave: clave, // Enviamos contraseña en texto plano
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                if (data.data[0].persona_estado == 1) {
                    // Login exitoso
                    const result = await signIn("credentials", {
                        datos: JSON.stringify(data.data[0]),
                        redirect: false,
                    });
                    
                    if (result.ok) {
                        window.location.replace(callbackUrl);
                    }
                } else if (data.data[0].persona_estado == 2) {
                    // Cuenta pendiente de activación
                    setErrorMessage("Su cuenta está pendiente de activación");
                } else {
                    setErrorMessage("Usuario inactivo");
                }
            } else {
                setErrorMessage(data.mensaje || "Error de autenticación");
            }
        } catch (error) {
            console.error('Error de login:', error);
            setErrorMessage("Error de conexión con el servidor");
        } finally {
            setBuscando(false);
        }
    };

    return (
        <Box 
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #140D0D 0%, #2D1B1B 50%, #140D0D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Container size={420} my={40}>
                <Card shadow="xl" padding="xl" radius="lg" withBorder>
                    <LoadingOverlay visible={buscando} overlayProps={{ blur: 2 }} />
                    
                    <Center mb={30}>
                        <Image src="/logos/logo.png" h={80} w="auto" />
                    </Center>
                    
                    <Title order={2} ta="center" mb={5} c="#140D0D">
                        Sistema de Gestión
                    </Title>
                    
                    <Text size="sm" ta="center" c="dimmed" mb={30}>
                        Ingrese sus credenciales para acceder
                    </Text>
                    
                    <Divider mb={30} />
                    
                    <form onSubmit={(e) => { e.preventDefault(); Login(); }}>
                        <Stack gap="md">
                            <TextInput
                                size="md"
                                label="Usuario o CUIL"
                                placeholder="Ingrese su usuario o CUIL"
                                required
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                leftSection={<IconUser size={18} />}
                                styles={{
                                    input: {
                                        borderColor: '#EE0E0F',
                                        '&:focus': {
                                            borderColor: '#EE0E0F'
                                        }
                                    }
                                }}
                            />
                            
                            <PasswordInput
                                size="md"
                                label="Contraseña"
                                placeholder="Ingrese su contraseña"
                                required
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                leftSection={<IconLock size={18} />}
                                styles={{
                                    input: {
                                        borderColor: '#EE0E0F',
                                        '&:focus': {
                                            borderColor: '#EE0E0F'
                                        }
                                    }
                                }}
                            />
                            
                            {errorMessage && (
                                <Alert 
                                    icon={<IconAlertCircle size={16} />} 
                                    title="Error de autenticación" 
                                    color="red"
                                    variant="light"
                                >
                                    {errorMessage}
                                </Alert>
                            )}
                            
                            <Button 
                                type="submit" 
                                fullWidth 
                                size="md"
                                color="#EE0E0F"
                                variant="filled"
                                mt={20}
                                disabled={buscando}
                                styles={{
                                    root: {
                                        backgroundColor: '#EE0E0F',
                                        '&:hover': {
                                            backgroundColor: '#CC0C0E'
                                        }
                                    }
                                }}
                            >
                                {buscando ? 'Ingresando...' : 'Ingresar al Sistema'}
                            </Button>
                        </Stack>
                    </form>
                    
                    <Divider mt={30} />
                    
                    <Text size="xs" ta="center" c="dimmed" mt={15}>
                        Sistema de Gestión Municipal © 2025
                    </Text>
                </Card>
            </Container>
        </Box>
    );
}

export default Login;