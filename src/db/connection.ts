import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'jaydev_fragrances',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Create a connection pool. We initialize it lazily to avoid crashing on startup.
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
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
    console.error(`Database query failed: ${sql}`, error);
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
 * Helper to log events and activities directly in MySQL (satisfying additional_user_instructions)
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
    console.error('Failed to write activity log to MySQL:', err);
  }
}
