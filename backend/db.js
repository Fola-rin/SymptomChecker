import pg from 'pg';

export const pool = new pg.Pool({
	user: 'postgres',
	host: process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0',
	port: 5432,
	database: 'symptopm_checker',
});
