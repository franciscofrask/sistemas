import * as jwt from 'jose';

async function VerificarToken(_token, _secret) {
    try {
        return await jwt.jwtVerify(_token, new TextEncoder().encode(_secret));
    } catch (e) {
        throw new Error('Token no válido');
    }
}

// Middleware para endpoints públicos (como login)
export function MiddlewarePagina(metodo, handler) {
    return async function (req, res) {
        try {
            if (!metodo.includes(req.method)) {
                throw new Error('Método no permitido');
            }

            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                throw new Error('Token no proporcionado');
            }
            
            // Verificar token del frontend (temporal)
            await VerificarToken(token, process.env.NEXT_PUBLIC_FRONT_JWT);
     
            return await handler(req, res);
        } catch (error) {
            return res.status(405).json({ 
                success: false, 
                mensaje: error.message 
            });
        }
    }
}

// Middleware para endpoints que requieren usuario logueado
export function MiddlewareUsuarioLogeado(metodo, handler) {
    return async function (req, res) {
        try {
            if (!metodo.includes(req.method)) {
                throw new Error('Método no permitido');
            }

            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                throw new Error('Token no proporcionado');
            }
            
            // Verificar token del usuario (persistente)
            const payload = await VerificarToken(token, process.env.NEXT_PUBLIC_USER_JWT);
            
            // Agregar datos del usuario al request
            req.usuario = payload.payload;

            return await handler(req, res);
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                mensaje: error.message 
            });
        }
    }
}