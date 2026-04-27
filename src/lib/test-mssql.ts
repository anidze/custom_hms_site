import 'dotenv/config';
import sql from 'mssql';

async function testConnection() {
    const connString = process.env.DATABASE_URL;
    
    console.log('Attempting to connect to database...');
    
    try {
        const pool = await sql.connect(connString as string);
        const result = await pool.request().query('SELECT @@VERSION as version');
        
        console.log('✅ Connected successfully!');
        console.log('SQL Server version:', result.recordset[0].version);
        
        await pool.close();
    } catch (err) {
        console.error('❌ Connection failed:', err instanceof Error ? err.message : err);
    }
}

testConnection();