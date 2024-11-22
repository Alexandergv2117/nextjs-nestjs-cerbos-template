import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as moment from 'moment-timezone';
import { HOSTNAME } from '../../env';
import { prismaErrorFilter } from '../../utils/prismaError.utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;
    const startTime = request.startTime || Date.now();
    const elapsedTime = Date.now() - startTime;
    const timezone = 'America/New_York';
    const formattedTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss Z');
    const stack_trace = this.getErrorLocation(exception.stack);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = exceptionResponse['message'] || message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      const prismaError = prismaErrorFilter({
        statusDefault: status,
        messageDefault: message,
        exception,
      });

      status = prismaError.status;
      message = prismaError.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else {
      console.error(exception);
    }

    const logMessage = {
      id: requestId,
      host_name: HOSTNAME,
      method: request.method,
      code: status,
      url: request.originalUrl,
      time: `${elapsedTime}ms`,
      timestamp: formattedTime,
      stack_trace,
      message,
    };

    console.log(JSON.stringify(logMessage));

    response.status(status).json({
      message,
    });
  }

  private getErrorLocation(stack: string): string {
    const stackLines = stack.split('\n');
    if (stackLines.length > 1) {
      const match = stackLines[1].match(/\((.+):(\d+):(\d+)\)/);
      if (match) {
        const [_, file, line, column] = match;
        return `File: ${file}, Line: ${line}, Column: ${column}`;
      }
    }
    return 'Location not found';
  }
}
