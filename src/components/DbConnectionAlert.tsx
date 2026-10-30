import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Terminal, CheckCircle2, Copy, Check, ChevronDown, ChevronUp, Server, Database, Key, HelpCircle } from 'lucide-react';

export interface DbStatusData {
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

interface DbConnectionAlertProps {
  status: DbStatusData;
  onRefresh: () => Promise<void>;
}

export default function DbConnectionAlert({ status, onRefresh }: DbConnectionAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  if (status.connected) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRefresh();
    } finally {
      setIsRetrying(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const dbName = status.config.database || 'jaydev_fragrances';
  const dbUser = status.config.user || 'root';
  const dbHost = status.config.host || '127.0.0.1';
  const dbPort = status.config.port || 3306;

  const sampleEnv = `# Database Configuration (MySQL)
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=your_actual_mysql_password
DB_DATABASE=${dbName}
`;

  const mysqlCommands = `-- Log in to MySQL as root:
-- mysql -u root -p

-- 1. Create database if it does not exist:
CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Ensure user has full privileges (change 'your_actual_mysql_password' to your password):
CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY 'your_actual_mysql_password';
GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'localhost';
FLUSH PRIVILEGES;`;

  const systemdCommands = `# 1. Check if MySQL or MariaDB is running on your VPS:
sudo systemctl status mysql || sudo systemctl status mariadb

# 2. Start MySQL service:
sudo systemctl start mysql

# 3. Enable MySQL to start automatically on system reboot:
sudo systemctl enable mysql

# 4. Restart your application process:
pm2 restart all || node dist/server.cjs`;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="bg-gradient-to-r from-amber-900/90 via-red-950/95 to-neutral-900 border-2 border-amber-500/80 rounded-2xl p-5 sm:p-6 text-white shadow-xl backdrop-blur-md relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-amber-100 tracking-wide">
                  Database Connection Offline
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-500/40 font-bold">
                  {status.error?.code || 'DISCONNECTED'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Target: {dbHost}:{dbPort}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
                The application cannot communicate with MySQL. Products, inventory, and categories are not loading because the database credentials in <code className="text-amber-300 font-mono">.env</code> could not be reached.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Testing Connection...' : 'Retry Connection'}</span>
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Toggle instructions"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Detailed Breakdown & Fix Guide */}
        {expanded && (
          <div className="mt-5 space-y-5 animate-in fade-in duration-200">
            
            {/* Diagnostic Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800/80">
                <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>Host & Port</span>
                </div>
                <p className="text-sm font-mono font-bold text-neutral-100 mt-1">
                  {dbHost}:{dbPort}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800/80">
                <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Database Name</span>
                </div>
                <p className="text-sm font-mono font-bold text-neutral-100 mt-1">
                  {dbName}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800/80">
                <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>User & Password</span>
                </div>
                <p className="text-sm font-mono font-bold text-neutral-100 mt-1">
                  {dbUser} {status.config.hasPassword ? '(Password set)' : '(No password)'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800/80">
                <div className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>.env File Detected</span>
                </div>
                <p className="text-xs font-mono font-semibold text-amber-300 truncate mt-1" title={status.config.envFilePath || 'None found'}>
                  {status.config.envFilePath ? status.config.envFilePath.replace(/^.*(?=\/[^\/]+\/\.env$|\/\.env$)/, '.') : '⚠️ No .env file found'}
                </p>
              </div>
            </div>

            {/* Error Message banner */}
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs sm:text-sm font-mono text-red-200 flex items-start gap-2">
              <span className="font-bold text-red-400 shrink-0">MySQL Error:</span>
              <span className="break-all">{status.error?.message || status.error?.sqlMessage || 'Connection failed'}</span>
            </div>

            {/* Actionable VPS Fix Instructions */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>How to Fix on Your VPS (Step-by-Step)</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Step 1: Check .env file */}
                <div className="bg-black/50 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        1. Verify .env file
                      </span>
                      <button
                        onClick={() => copyToClipboard(sampleEnv, 'env')}
                        className="text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'env' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Ensure your <code className="text-amber-200">.env</code> exists in your app folder and contains valid database credentials:
                    </p>
                    <pre className="mt-2 p-2.5 bg-neutral-950 rounded-lg text-[10px] font-mono text-neutral-300 overflow-x-auto border border-neutral-800">
                      {sampleEnv}
                    </pre>
                  </div>
                </div>

                {/* Step 2: Start MySQL service */}
                <div className="bg-black/50 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        2. Start MySQL Service
                      </span>
                      <button
                        onClick={() => copyToClipboard(systemdCommands, 'service')}
                        className="text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {copiedKey === 'service' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'service' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Run in your VPS terminal to ensure MySQL is active and responding:
                    </p>
                    <pre className="mt-2 p-2.5 bg-neutral-950 rounded-lg text-[10px] font-mono text-neutral-300 overflow-x-auto border border-neutral-800">
                      {`sudo systemctl status mysql\nsudo systemctl start mysql`}
                    </pre>
                  </div>
                </div>

                {/* Step 3: Create DB & User */}
                <div className="bg-black/50 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        3. Create DB & Permissions
                      </span>
                      <button
                        onClick={() => copyToClipboard(mysqlCommands, 'sql')}
                        className="text-[10px] text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {copiedKey === 'sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'sql' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      If the database or user does not exist, run these SQL commands:
                    </p>
                    <pre className="mt-2 p-2.5 bg-neutral-950 rounded-lg text-[10px] font-mono text-neutral-300 overflow-x-auto border border-neutral-800">
                      {`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;\nGRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'localhost';`}
                    </pre>
                  </div>
                </div>

              </div>

              {/* Suggestions List */}
              {status.suggestions && status.suggestions.length > 0 && (
                <div className="bg-neutral-950/80 border border-amber-500/20 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                    Troubleshooting Recommendations:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-300 list-disc list-inside">
                    {status.suggestions.map((sug, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
