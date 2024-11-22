import { HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const prismaErrorFilter = ({
  statusDefault,
  messageDefault,
  exception,
}: {
  statusDefault: HttpStatus;
  messageDefault: string;
  exception: PrismaClientKnownRequestError;
}): { status: HttpStatus; message: string } => {
  if (exception.code === 'P2002') {
    return {
      status: HttpStatus.CONFLICT,
      message:
        'Unique constraint failed on the fields: ' +
        (exception.meta?.target as string[])?.join(', '),
    };
  } else {
    console.error(exception);
  }

  return {
    status: statusDefault,
    message: messageDefault,
  };
};