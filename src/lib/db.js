import { service_DBconn } from '@/services/db';

export const db = {
  async query(sql, params = []) {
    const connection = await service_DBconn();
    try {
      const [rows] = await connection.execute(sql, params);
      await connection.end();
      return [rows];
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
};