import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as moment from 'moment-timezone';
import { HOSTNAME } from '../../env';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;
    const requestId = req.headers['x-request-id'] as string;
    const startTime = Date.now();
    req.startTime = startTime;

    const timezone = 'America/New_York';
    const formattedTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss Z');

    res.on('finish', () => {
      const { statusCode } = res;
      if (statusCode < 400) {
        const elapsedTime = Date.now() - startTime;

        const logMessage = {
          id: requestId,
          host_name: HOSTNAME,
          method,
          code: statusCode,
          url: originalUrl,
          time: `${elapsedTime}ms`,
          timestamp: formattedTime,
          body: JSON.stringify(body),
        };

        console.log(JSON.stringify(logMessage));
      }
    });

    next();
  }
}
