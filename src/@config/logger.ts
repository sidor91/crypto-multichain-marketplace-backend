import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLogger implements NestMiddleware {
  private logger = new Logger('RequestLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = process.hrtime();

    res.on('finish', () => {
      const duration = process.hrtime(start);
      const ms = duration[0] * 1000 + duration[1] / 1000000;
      this.logger.log(`${method} ${originalUrl} - ${ms.toFixed(2)} ms`);
    });

    next();
  }
}

export class TypeOrmLogger extends Logger {
  private readonly slowQueryThreshold = 200;

  logQuery(query: string, parameters?: any[]): any {
    const startTime = Date.now();
    super.log(`[Query]: ${query}`);
    if (parameters && parameters.length > 0) {
      super.log(`[Parameters]: ${JSON.stringify(parameters)}`);
    }
    const executionTime = Date.now() - startTime;
    super.log(`[Execution Time]: ${executionTime} ms`);
  }

  logQueryError(error: string, query: string, parameters?: any[]): any {
    const startTime = Date.now();
    super.error(`[Query Error]: ${error}`);
    super.log(`[Query]: ${query}`);
    if (parameters && parameters.length > 0) {
      super.log(`[Parameters]: ${JSON.stringify(parameters)}`);
    }
    const executionTime = Date.now() - startTime;
    super.log(`[Execution Time]: ${executionTime} ms`);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]): any {
    if (time > this.slowQueryThreshold) {
      super.warn(`[Slow Query: ${time} ms]: ${query}`);
      if (parameters && parameters.length > 0) {
        super.log(`[Parameters]: ${JSON.stringify(parameters)}`);
      }
    }
  }

  logSchemaBuild(message: string): any {
    super.log(`[Schema Build]: ${message}`);
  }

  logMigration(message: string): any {
    super.log(`[Migration]: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any): any {
    switch (level) {
      case 'log':
      case 'info':
        super.log(message);
        break;
      case 'warn':
        super.warn(message);
        break;
    }
  }
}
