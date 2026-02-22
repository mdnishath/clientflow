/**
 * Next.js Instrumentation
 *
 * Global error handlers for preventing crashes from browser automation errors
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Handle uncaught exceptions (e.g., ECONNRESET from browser automation)
    process.on('uncaughtException', (error: Error) => {
      const msg = error.message || '';
      const code = (error as any).code || '';

      // Browser/network connection errors - expected during automation, safe to ignore
      if (
        code === 'ECONNRESET' ||
        code === 'EPIPE' ||
        code === 'ECONNABORTED' ||
        msg === 'aborted' ||
        msg.includes('ECONNRESET') ||
        msg.includes('EPIPE') ||
        msg.includes('socket hang up') ||
        msg.includes('Connection closed') ||
        msg.includes('Protocol error') ||
        msg.includes('aborted') ||
        msg.includes('read ECONNRESET') ||
        msg.includes('write EPIPE') ||
        msg.includes('Failed to find Server Action')
      ) {
        console.warn(`[Recovered] Suppressed error: ${msg || code}`);
        return; // Don't crash
      }

      // Other critical errors - log them but don't exit
      console.error('[ERROR] Uncaught Exception:', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      const msg = reason instanceof Error ? reason.message : String(reason || '');
      const code = reason?.code || '';

      if (
        code === 'ECONNRESET' ||
        code === 'EPIPE' ||
        code === 'ECONNABORTED' ||
        msg === 'aborted' ||
        msg.includes('ECONNRESET') ||
        msg.includes('EPIPE') ||
        msg.includes('socket hang up') ||
        msg.includes('Connection closed') ||
        msg.includes('Protocol error') ||
        msg.includes('Target closed') ||
        msg.includes('aborted')
      ) {
        console.warn(`[Recovered] Suppressed rejection: ${msg || code}`);
        return;
      }

      console.error('[WARN] Unhandled Rejection:', reason);
    });

    console.log('✅ Global error handlers registered');
  }
}
