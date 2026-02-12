/**
 * Professional Logger Utility
 * Replaces console.log with structured logging
 * Features: Log levels, structured data, timestamps, environment awareness
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
}

interface LogEntry {
    timestamp: string;
    level: keyof typeof LogLevel;
    message: string;
    data?: any;
    context?: string;
    userId?: string;
    error?: Error;
}

class Logger {
    private minLevel: LogLevel;
    private isDevelopment: boolean;
    private logs: LogEntry[] = [];
    private maxLogs = 1000; // Keep last 1000 logs in memory

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === "development";
        // In production, only log WARN and above
        this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.minLevel;
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private createLogEntry(
        level: keyof typeof LogLevel,
        message: string,
        data?: any,
        context?: string
    ): LogEntry {
        return {
            timestamp: this.formatTimestamp(),
            level,
            message,
            data,
            context,
        };
    }

    private storeLog(entry: LogEntry) {
        this.logs.push(entry);
        // Keep only last maxLogs entries to prevent memory leaks
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    private log(
        level: keyof typeof LogLevel,
        message: string,
        data?: any,
        context?: string
    ) {
        if (!this.shouldLog(LogLevel[level])) return;

        const entry = this.createLogEntry(level, message, data, context);
        this.storeLog(entry);

        // Console output with colors
        const emoji = {
            DEBUG: "🔍",
            INFO: "ℹ️",
            WARN: "⚠️",
            ERROR: "❌",
            FATAL: "💀",
        };

        const color = {
            DEBUG: "#6B7280", // gray
            INFO: "#3B82F6", // blue
            WARN: "#F59E0B", // amber
            ERROR: "#EF4444", // red
            FATAL: "#7C2D12", // dark red
        };

        if (this.isDevelopment) {
            const timestamp = entry.timestamp.split("T")[1].split(".")[0];
            const prefix = `${emoji[level]} [${timestamp}] ${context ? `[${context}]` : ""}`;

            console.log(
                `%c${prefix} ${message}`,
                `color: ${color[level]}; font-weight: bold;`,
                data || ""
            );
        } else {
            // In production, use standard console methods
            const method = level === "DEBUG" ? "log" : level.toLowerCase();
            (console as any)[method](
                `[${entry.timestamp}] ${context ? `[${context}]` : ""} ${message}`,
                data || ""
            );
        }

        // TODO: Send to external service in production
        // Example: Sentry, LogRocket, Datadog, etc.
        if (!this.isDevelopment && LogLevel[level] >= LogLevel.ERROR) {
            this.sendToExternalService(entry);
        }
    }

    private sendToExternalService(entry: LogEntry) {
        // TODO: Implement external logging service integration
        // Example: Sentry.captureMessage(entry.message, { level: entry.level.toLowerCase(), extra: entry.data });
        // For now, this is a placeholder
    }

    // Public API
    debug(message: string, data?: any, context?: string) {
        this.log("DEBUG", message, data, context);
    }

    info(message: string, data?: any, context?: string) {
        this.log("INFO", message, data, context);
    }

    warn(message: string, data?: any, context?: string) {
        this.log("WARN", message, data, context);
    }

    error(message: string, error?: Error | any, context?: string) {
        const entry = this.createLogEntry("ERROR", message, error, context);
        if (error instanceof Error) {
            entry.error = error;
            entry.data = {
                errorMessage: error.message,
                stack: error.stack,
                name: error.name,
            };
        }
        this.storeLog(entry);

        if (this.isDevelopment) {
            console.error(
                `❌ [${entry.timestamp.split("T")[1].split(".")[0]}] ${context ? `[${context}]` : ""} ${message}`,
                error
            );
        } else {
            console.error(
                `[${entry.timestamp}] ${context ? `[${context}]` : ""} ${message}`,
                error
            );
            this.sendToExternalService(entry);
        }
    }

    fatal(message: string, error?: Error | any, context?: string) {
        this.log("FATAL", message, error, context);
        // Fatal errors should always be logged
        if (!this.isDevelopment) {
            this.sendToExternalService(
                this.createLogEntry("FATAL", message, error, context)
            );
        }
    }

    // Performance logging
    time(label: string) {
        console.time(label);
    }

    timeEnd(label: string) {
        console.timeEnd(label);
    }

    // Get recent logs (useful for debugging or showing in UI)
    getRecentLogs(count: number = 100): LogEntry[] {
        return this.logs.slice(-count);
    }

    // Clear logs (useful for testing or memory management)
    clearLogs() {
        this.logs = [];
    }

    // Export logs (for debugging or support)
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions for common patterns
export const logApi = {
    request: (method: string, url: string, data?: any) => {
        logger.debug(`API ${method} ${url}`, data, "API");
    },
    response: (method: string, url: string, status: number, data?: any) => {
        logger.debug(`API ${method} ${url} -> ${status}`, data, "API");
    },
    error: (method: string, url: string, error: Error) => {
        logger.error(`API ${method} ${url} failed`, error, "API");
    },
};

export const logAuth = {
    login: (userId: string) => {
        logger.info(`User logged in: ${userId}`, undefined, "AUTH");
    },
    logout: (userId: string) => {
        logger.info(`User logged out: ${userId}`, undefined, "AUTH");
    },
    failed: (reason: string) => {
        logger.warn(`Auth failed: ${reason}`, undefined, "AUTH");
    },
};

export const logAutomation = {
    start: (reviewCount: number, concurrency: number) => {
        logger.info(
            `Starting batch check: ${reviewCount} reviews with ${concurrency} threads`,
            undefined,
            "AUTOMATION"
        );
    },
    progress: (completed: number, total: number) => {
        logger.debug(
            `Progress: ${completed}/${total}`,
            undefined,
            "AUTOMATION"
        );
    },
    complete: (stats: any) => {
        logger.info(`Batch check completed`, stats, "AUTOMATION");
    },
    error: (error: Error) => {
        logger.error(`Automation error`, error, "AUTOMATION");
    },
};
