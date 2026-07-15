import morgan from 'morgan';
import { env } from '@/config/env';

// Logs every incoming HTTP request
// (method, URL, status code, response time) to the console
export const requestLogger = morgan(
    env.NODE_ENV === 'production' ? 'combined' // Apache-style detailed log
                                  : 'dev'      // Colored, concise output
);
