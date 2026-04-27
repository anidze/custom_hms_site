import sql from 'mssql';

// Parse "sqlserver://host:port;key=value;..." into mssql config
function parseDatabaseUrl(url: string): sql.config {
    // Strip scheme
    const withoutScheme = url.replace(/^sqlserver:\/\//, '');
    const parts = withoutScheme.split(';');

    // First part is host:port
    const [host, portStr] = parts[0].split(':');
    const port = portStr ? parseInt(portStr, 10) : 1433;

    const params: Record<string, string> = {};
    for (const part of parts.slice(1)) {
        const eqIndex = part.indexOf('=');
        if (eqIndex === -1) continue;
        const key = part.slice(0, eqIndex).toLowerCase();
        const value = part.slice(eqIndex + 1);
        params[key] = value;
    }

    return {
        server: host,
        port,
        database: params['database'] ?? 'master',
        user: params['user'],
        password: params['password'],
        options: {
            enableArithAbort: true,
            trustServerCertificate: params['trustservercertificate'] === 'true',
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
    };
}

// Global variable to prevent duplicate connections
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export const getDB = () => {
    if (poolPromise) return poolPromise;

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');

    const config = parseDatabaseUrl(dbUrl);

    poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log('✅ Connected to SQL Server');
            return pool;
        })
        .catch(err => {
            poolPromise = null;
            console.error('❌ SQL Server connection error:', err);
            throw err;
        });

    return poolPromise;
};