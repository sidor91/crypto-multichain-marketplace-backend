import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class TryCatchInterceptor implements NestInterceptor {
  private logger: Logger;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger = new Logger(context.getClass().name);

    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const contextName = `${request.method} ${request.url}`;

    return next.handle().pipe(
      catchError((error) => {
        let errorMessages = error?.response?.message || error?.message;
        if (!Array.isArray(errorMessages)) {
          errorMessages = [errorMessages];
        }
        this.logger.error(
          `Error occurred in ${contextName}: ${errorMessages.join(', ')}`,
        );
        throw new BadRequestException({
          success: false,
          errors: errorMessages,
        });
      }),
      map((data) => {
        for (const type in data.data) {
          if (data.data.hasOwnProperty(type)) {
            if (Array.isArray(data.data[type])) {
              data.data[type]?.map((item) => {
                this.transformBigintToString(item);
              });
            }
          }
        }
        return data;
      }),
    );
  }

  private transformBigintToString(item: any): any {
    Object.keys(item).forEach((key) => {
      if (typeof item[key] === 'bigint') {
        item[key] = item[key].toString();
      }
    });
  }
}
