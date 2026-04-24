import sql from 'mssql';

const config = {
    connectionString: process.env.DATABASE_URL,
    options: {
        enableArithAbort: true,
        trustServerCertificate: true // ლოკალური დეველოპმენტისთვის
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// გლობალური ცვლადი, რომ კავშირი არ გაორმაგდეს
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export const getDB = () => {
    if (poolPromise) return poolPromise;
    
    poolPromise = new sql.ConnectionPool(config as any)
        .connect()
        .then(pool => {
            console.log('✅ SQL Server-თან კავშირი დამყარდა');
            return pool;
        })
        .catch(err => {
            poolPromise = null;
            console.error('❌ SQL Server-ის კავშირის შეცდომა:', err);
            throw err;
        });

    return poolPromise;
};