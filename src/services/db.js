import mysql from 'mysql2/promise';

export async function service_DBconn() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.NEXT_PUBLIC_DB_HOST,
            user: process.env.NEXT_PUBLIC_DB_USER,
            password: process.env.NEXT_PUBLIC_DB_PW,
            database: process.env.NEXT_PUBLIC_DB_DB,
            port: parseInt(process.env.NEXT_PUBLIC_DB_PORT),
            connectTimeout: 60000,
        });
        
        return connection;
    } catch (error) {
        console.error('Error de conexión detallado:', error);
        throw new Error(`Error conectando a la base de datos: ${error.message}`);
    }
}