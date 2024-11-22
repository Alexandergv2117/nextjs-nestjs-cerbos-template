export type DbType = 'sql';

export const PORT = parseInt(process.env.PORT, 10) || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const HOSTNAME = process.env.HOSTNAME || 'localhost';

export const DB_TYPE: DbType = 'sql';