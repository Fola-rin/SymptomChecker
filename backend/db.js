import pg from 'pg';

export const pool = new pg.Pool({
	user: process.env.DATABASE_USER,
	host: process.env.DATABASE_HOST,
	port: 5432,
	database: 'symptopm_checker',
	password: process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : '',
});
