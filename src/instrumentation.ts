/**
 * Next.js 15 Instrumentation
 *
 * Global error handlers for preventing crashes from browser automation errors
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Handle uncaught exceptions (e.g., ECONNRESET from browser automation)
    process.on('uncaughtException', (error: Error) => {
      // Log the error but don't crash the app
      if (error.message.includes('ECONNRESET') ||
          error.message.includes('EPIPE') ||
          error.message.includes('socket hang up') ||
          error.message.includes('Connection closed') ||
          error.message.includes('Protocol error')) {
        // Browser connection errors - expected during automation, safe to ignore
        console.log(`[Browser] Connection error (ignored): ${error.message}`);
      } else {
        // Other critical errors - log them
        console.error('Uncaught Exception:', error);
        // Don't exit process - let PM2 handle if needed
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      const errorMessage = reason instanceof Error ? reason.message : String(reason);

      // Ignore browser automation connection errors
      if (errorMessage.includes('ECONNRESET') ||
          errorMessage.includes('EPIPE') ||
          errorMessage.includes('socket hang up') ||
          errorMessage.includes('Connection closed') ||
          errorMessage.includes('Protocol error') ||
          errorMessage.includes('Target closed')) {
        console.log(`[Browser] Promise rejection (ignored): ${errorMessage}`);
      } else {
        // Log other rejections
        console.error('Unhandled Rejection:', reason);
      }
    });

    console.log('✅ Global error handlers registered');
  }
}
