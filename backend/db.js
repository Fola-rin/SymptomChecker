import pg from "pg";

export const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'symptopm_checker'
});