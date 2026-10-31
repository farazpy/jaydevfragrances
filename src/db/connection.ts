import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// ENVIRONMENT VARIABLE LOADER FOR MULTI-DIRECTORY VPS DEPLOYMENTS
// -------------------------------------------------------------
let loadedEnvPath: string | null = null;
let detectedEnvKeys: string[] = [];

/**
 * Searches and loads .env from multiple candidate paths so that regardless
 * of whether Node is started from /app, /app/dist, /var/www, or PM2, the
 * configuration is properly loaded with override=true.
 */
export function loadEnvConfig(): { envPath: string | null; keys: string[] } {
  // If already loaded and valid, return cached unless reload is desired
  if (loadedEnvPath && fs.existsSync(loadedEnvPath)) {
    return { envPath: loadedEnvPath, keys: detectedEnvKeys };
  }

  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  
  const safeCwd = () => {
    try {
      return !isBrowser ? process.cwd() : '';
    } catch {
      return '';
    }
  };

  const cwd = safeCwd();

  const candidateDirs = [
    cwd,
    typeof __dirname !== 'undefined' ? __dirname : '',
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, '..') : '',
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../..') : '',
    cwd ? path.resolve(cwd, '..') : '',
    cwd ? path.resolve(cwd, '../..') : ''
  ].filter(Boolean);

  const envFilenames = ['.env', '.env.production', '.env.local'];

  // Check explicit override first
  if (process.env.ENV_FILE && fs.existsSync(process.env.ENV_FILE)) {
    dotenv.config({ path: process.env.ENV_FILE, override: true });
    loadedEnvPath = process.env.ENV_FILE;
  } else {
    for (const dir of candidateDirs) {
      for (const fname of envFilenames) {
        const full = path.resolve(dir, fname);
        if (fs.existsSync(full)) {
          dotenv.config({ path: full, override: true });
          loadedEnvPath = full;
          break;
        }
      }
      if (loadedEnvPath) break;
    }
  }

  // Fallback to standard dotenv
  if (!loadedEnvPath && cwd) {
    const defaultPath = path.resolve(cwd, '.env');
    if (fs.existsSync(defaultPath)) {
      dotenv.config({ path: defaultPath, override: true });
      loadedEnvPath = defaultPath;
    }
  }

  detectedEnvKeys = [
    'DB_HOST', 'MYSQL_HOST', 'DATABASE_HOST', 'MYSQLHOST', 'DB_HOSTNAME',
    'DB_PORT', 'MYSQL_PORT', 'DATABASE_PORT', 'MYSQLPORT',
    'DB_USER', 'MYSQL_USER', 'DB_USERNAME', 'DATABASE_USER', 'MYSQLUSER',
    'DB_PASSWORD', 'DB_PASS', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD', 'DATABASE_PASSWORD',
    'DB_DATABASE', 'DB_NAME', 'MYSQL_DATABASE', 'DATABASE_NAME', 'MYSQLDATABASE', 'MYSQL_DB',
    'DATABASE_URL', 'MYSQL_URL', 'PORT', 'NODE_ENV'
  ].filter(k => !!process.env[k]);

  return { envPath: loadedEnvPath, keys: detectedEnvKeys };
}

// Initial immediate load
loadEnvConfig();

/**
 * Strips accidental wrapping quotes and leading/trailing whitespace
 * from .env values (e.g. `DB_PASS="password"` or `DB_HOST='127.0.0.1' `)
 */
function cleanEnvValue(val: string | undefined): string | undefined {
  if (val === undefined || val === null) return undefined;
  let str = String(val).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Dynamically computes database configuration with comprehensive VPS aliases.
 */
export function getDbConfig() {
  loadEnvConfig();

  // Support DATABASE_URL or MYSQL_URL if defined
  const rawUrl = cleanEnvValue(process.env.DATABASE_URL || process.env.MYSQL_URL);
  let parsedUrl: any = {};
  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      parsedUrl = {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 3306,
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname ? u.pathname.replace(/^\//, '') : undefined
      };
    } catch {
      // Ignored
    }
  }

  const host = cleanEnvValue(
    process.env.DB_HOST ||
    process.env.MYSQL_HOST ||
    process.env.DATABASE_HOST ||
    process.env.MYSQLHOST ||
    process.env.DB_HOSTNAME ||
    parsedUrl.host
  ) || '127.0.0.1';

  const rawPort = cleanEnvValue(
    process.env.DB_PORT ||
    process.env.MYSQL_PORT ||
    process.env.DATABASE_PORT ||
    process.env.MYSQLPORT ||
    (parsedUrl.port ? String(parsedUrl.port) : undefined)
  );
  const port = rawPort ? parseInt(rawPort, 10) : 3306;

  const user = cleanEnvValue(
    process.env.DB_USER ||
    process.env.DB_USERNAME ||
    process.env.MYSQL_USER ||
    process.env.DATABASE_USER ||
    process.env.MYSQLUSER ||
    parsedUrl.user
  ) || 'root';

  const password = cleanEnvValue(
    process.env.DB_PASSWORD ||
    process.env.DB_PASS ||
    process.env.MYSQL_PASSWORD ||
    process.env.MYSQL_ROOT_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    process.env.MYSQLPASSWORD ||
    parsedUrl.password
  ) || '';

  const database = cleanEnvValue(
    process.env.DB_DATABASE ||
    process.env.DB_NAME ||
    process.env.MYSQL_DATABASE ||
    process.env.DATABASE_NAME ||
    process.env.MYSQLDATABASE ||
    process.env.MYSQL_DB ||
    parsedUrl.database
  ) || 'jaydev_fragrances';

  const socketPath = cleanEnvValue(
    process.env.DB_SOCKET_PATH ||
    process.env.MYSQL_SOCKET ||
    process.env.DB_SOCKET
  );

  const enableSsl = process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true';

  const config: mysql.PoolOptions = {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 8000
  };

  if (socketPath) {
    config.socketPath = socketPath;
  }

  if (enableSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

// -------------------------------------------------------------
// CONNECTION POOL MANAGEMENT
// -------------------------------------------------------------
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDbConfig();
    pool = mysql.createPool(config);
  }
  return pool;
}

export async function resetPool(): Promise<void> {
  if (pool) {
    try {
      await pool.end();
    } catch {
      // ignore close errors
    }
    pool = null;
  }
}

// -------------------------------------------------------------
// DATABASE STATUS & DIAGNOSTICS INTERFACE
// -------------------------------------------------------------
export interface DbStatusResponse {
  connected: boolean;
  checkedAt: string;
  config: {
    host: string;
    port: number;
    user: string;
    database: string;
    hasPassword: boolean;
    socketPath?: string;
    ssl: boolean;
    envFilePath: string | null;
    envKeysDetected: string[];
  };
  error: {
    code?: string;
    errno?: number;
    sqlMessage?: string;
    message: string;
    syscall?: string;
    address?: string;
    port?: number;
  } | null;
  suggestions: string[];
}

let lastDbStatus: DbStatusResponse = {
  connected: false,
  checkedAt: new Date().toISOString(),
  config: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    database: 'jaydev_fragrances',
    hasPassword: false,
    ssl: false,
    envFilePath: null,
    envKeysDetected: []
  },
  error: null,
  suggestions: []
};

export function getDbStatus(): DbStatusResponse {
  return lastDbStatus;
}

/**
 * Actively checks database connectivity and generates actionable VPS recovery suggestions.
 */
export async function testDbConnection(forceReconnect = false): Promise<DbStatusResponse> {
  if (forceReconnect) {
    await resetPool();
  }

  const { envPath, keys } = loadEnvConfig();
  const cfg = getDbConfig();

  const publicConfig = {
    host: cfg.host || '127.0.0.1',
    port: cfg.port || 3306,
    user: cfg.user || 'root',
    database: cfg.database || 'jaydev_fragrances',
    hasPassword: !!cfg.password,
    socketPath: cfg.socketPath,
    ssl: !!cfg.ssl,
    envFilePath: envPath,
    envKeysDetected: keys
  };

  try {
    const currentPool = getPool();
    const conn = await currentPool.getConnection();
    try {
      await conn.ping();
      await conn.query('SELECT 1 as alive');
      conn.release();

      lastDbStatus = {
        connected: true,
        checkedAt: new Date().toISOString(),
        config: publicConfig,
        error: null,
        suggestions: []
      };
      return lastDbStatus;
    } catch (pingErr) {
      conn.release();
      throw pingErr;
    }
  } catch (err: any) {
    const errCode = err.code || 'UNKNOWN_ERROR';
    const suggestions: string[] = [];

    // Auto-recovery attempt: If the only error is that the database doesn't exist yet, try to auto-create it
    if (errCode === 'ER_BAD_DB_ERROR' || err.errno === 1049) {
      try {
        console.log(`Database '${cfg.database}' does not exist yet. Attempting auto-creation...`);
        const rootConn = await mysql.createConnection({
          host: cfg.host,
          port: cfg.port,
          user: cfg.user,
          password: cfg.password,
          socketPath: cfg.socketPath,
          connectTimeout: 5000
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await rootConn.end();
        console.log(`✓ Successfully auto-created database '${cfg.database}'.`);

        // Reconnect pool now that database exists
        await resetPool();
        const retryPool = getPool();
        const retryConn = await retryPool.getConnection();
        await retryConn.ping();
        retryConn.release();

        lastDbStatus = {
          connected: true,
          checkedAt: new Date().toISOString(),
          config: publicConfig,
          error: null,
          suggestions: []
        };
        return lastDbStatus;
      } catch (autoCreateErr: any) {
        console.warn('Auto-creation of database failed:', autoCreateErr.message);
      }
    }

    if (!envPath) {
      suggestions.push(
        `No .env file was found. Create a .env file in your application root directory (where package.json is located).`
      );
    }

    if (errCode === 'ECONNREFUSED') {
      suggestions.push(
        `MySQL server is not accepting connections at ${publicConfig.host}:${publicConfig.port}.`,
        `On Ubuntu/Debian VPS, check if MySQL is running: sudo systemctl status mysql (or sudo systemctl status mariadb)`,
        `Start MySQL service: sudo systemctl start mysql`,
        `If MySQL is on this VPS, ensure your .env has DB_HOST=127.0.0.1 and DB_PORT=3306`,
        `If connecting to a remote database, check /etc/mysql/mysql.conf.d/mysqld.cnf and ensure "bind-address = 0.0.0.0", then open port ${publicConfig.port} in firewall: sudo ufw allow ${publicConfig.port}`
      );
    } else if (errCode === 'ER_ACCESS_DENIED_ERROR' || err.errno === 1045) {
      suggestions.push(
        `Access denied for user '${publicConfig.user}'@'${publicConfig.host}'. Username or password in .env is incorrect.`,
        `Verify DB_USER and DB_PASSWORD in your .env file.`,
        `To grant full permissions to this user in MySQL on your VPS, run: mysql -u root -p`,
        `Execute SQL: CREATE USER IF NOT EXISTS '${publicConfig.user}'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';`,
        `Execute SQL: GRANT ALL PRIVILEGES ON \`${publicConfig.database}\`.* TO '${publicConfig.user}'@'localhost'; FLUSH PRIVILEGES;`
      );
    } else if (errCode === 'ER_BAD_DB_ERROR' || err.errno === 1049) {
      suggestions.push(
        `Database '${publicConfig.database}' does not exist on your MySQL server.`,
        `Create it on your VPS terminal: mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \\\`${publicConfig.database}\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`,
        `Or verify that DB_DATABASE in your .env points to the correct existing database name.`
      );
    } else if (errCode === 'ENOTFOUND' || errCode === 'EAI_AGAIN') {
      suggestions.push(
        `Host '${publicConfig.host}' could not be resolved by DNS.`,
        `If MySQL runs locally on the same VPS, set DB_HOST=127.0.0.1 in your .env.`
      );
    } else if (errCode === 'ETIMEDOUT') {
      suggestions.push(
        `Connection to ${publicConfig.host}:${publicConfig.port} timed out.`,
        `Check cloud VPS security groups (e.g. AWS Security Group, DigitalOcean Firewall, or UFW) to allow traffic on port ${publicConfig.port}.`
      );
    } else {
      suggestions.push(
        `Check that the MySQL server is active and reachable from this process.`,
        `Review credentials in your VPS .env file (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE).`,
        `After updating .env, restart the server with: pm2 restart all (or node dist/server.cjs).`
      );
    }

    lastDbStatus = {
      connected: false,
      checkedAt: new Date().toISOString(),
      config: publicConfig,
      error: {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        message: err.message || 'Database connection failed',
        syscall: err.syscall,
        address: err.address,
        port: err.port
      },
      suggestions
    };

    return lastDbStatus;
  }
}

/**
 * Execute a SQL query and return the rows.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const activePool = getPool();
  try {
    const [results] = await activePool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.warn(`[Database Offline] Query unavailable: ${sql.substring(0, 60)}... (${error.message})`);
    } else {
      console.error(`Database query failed: ${sql}`, error);
    }
    throw error;
  }
}

/**
 * Execute a SQL query and return the results as standard rows (useful for SELECTs)
 */
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const res = await query<any>(sql, params);
  if (Array.isArray(res)) {
    return res as T[];
  }
  return [] as T[];
}

/**
 * Helper to log events and activities directly in MySQL
 */
export async function logActivity(params: {
  userId: number | null;
  sessionId: string | null;
  eventType: string;
  affectedModule: string;
  requestMetadata?: any;
  responseStatus?: number;
  deviceInfo?: string;
  ipAddress?: string;
  contextData?: any;
}) {
  try {
    const sql = `
      INSERT INTO activity_logs 
      (user_id, session_id, event_type, affected_module, request_metadata, response_status, device_info, ip_address, context_data) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const metadataStr = params.requestMetadata ? JSON.stringify(params.requestMetadata) : null;
    const contextStr = params.contextData ? JSON.stringify(params.contextData) : null;
    
    await query(sql, [
      params.userId,
      params.sessionId,
      params.eventType,
      params.affectedModule,
      metadataStr,
      params.responseStatus || null,
      params.deviceInfo || null,
      params.ipAddress || null,
      contextStr
    ]);
  } catch (err) {
    // Non-blocking log failure
  }
}
