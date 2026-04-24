import 'dotenv/config';
import sql from 'mssql';

async function testConnection() {
    const connString = process.env.DATABASE_URL;
    
    console.log('ბაზასთან დაკავშირების მცდელობა...');
    
    try {
        const pool = await sql.connect(connString as string);
        const result = await pool.request().query('SELECT @@VERSION as version');
        
        console.log('✅ წარმატებით დაუკავშირდა!');
        console.log('SQL Server ვერსია:', result.recordset[0].version);
        
        await pool.close();
    } catch (err) {
        console.error('❌ კავშირი ვერ დამყარდა:', err.message);
    }
}

testConnection();