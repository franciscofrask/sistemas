import { getSession } from "next-auth/react";

export const ObtenerToken = async (req) => {
    try {
        const session = await getSession({ req });
        const token = session?.usuario?.token;
        return token;
    } catch (error) {
        return null;
    }
};

export const ObtenerUsuario = async (req) => {
    try {
        const session = await getSession({ req });
        const usuario = session?.usuario;
        return usuario;
    } catch (error) {
        return null;
    }
};

export const ObtenerIdUsuario = async (req) => {
    try {
        const session = await getSession({ req });
        const id_usuario = session?.usuario?.id;
        return id_usuario;
    } catch (error) {
        return null;
    }
};