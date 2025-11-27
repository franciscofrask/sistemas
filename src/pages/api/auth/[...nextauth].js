import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import * as jwt from 'jose';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {},
            async authorize(credentials) {
                const user = JSON.parse(credentials.datos);
                
                if (user) {
                    return {
                        ...user,
                        role: user.role,
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Cuando el usuario hace login
            if (user) {
                token = {
                    ...token,
                    id: user.id,
                    uid: user.uid,
                    cuil_cuit: user.cuil_cuit,
                    nombre: user.nombre,
                    role: user.role,
                    mail: user.mail,
                };
            }
            return token;
        },
        async session({ session, token }) {
            // Generar JWT personalizado para el usuario
            let jwt_token = await new jwt.SignJWT({ 
                id: token.id, 
                uid: token.uid, 
                role: token.role 
            })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(process.env.NEXT_PUBLIC_USER_JWT_TIME)
            .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_USER_JWT));
            
            if (token) {
                session.user = {
                    id: token.id,
                    uid: token.uid,
                    nombre: token.nombre,
                    cuil_cuit: token.cuil_cuit,
                    role: token.role,
                    mail: token.mail,
                    token: jwt_token,
                };
            }
            return session;
        },
    },
    pages: {
        signIn: '/autenticacion/ingresar',
        signOut: '/autenticacion/cerrar-sesion',
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 horas
    },
    jwt: {
        secret: "tu_jwt_secret_muy_seguro",
        maxAge: 8 * 60 * 60, // 8 horas
    },
};

export default NextAuth(authOptions);