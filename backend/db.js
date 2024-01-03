import pg from 'pg';

export const pool = new pg.Pool({
	user:
		process.env.NODE_ENV === 'development'
			? 'postgres'
			: 'symptopm_checker_user',
	host:
		process.env.NODE_ENV === 'development'
			? 'localhost'
			: process.env.DATABASE_HOST,
	port: 5432,
	database: 'symptopm_checker',
	password:
		process.env.NODE_ENV === 'development' ? '' : process.env.DATABASE_PASSWORD,
});
