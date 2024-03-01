import { IResponseSchema } from '../interfaces/response-schema.interface';

export class ResponseSchema<T> implements IResponseSchema<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;

  constructor(code?: number, message?: string, data?: T, error: string = null) {
    this.statusCode = code;
    this.message = message;
    data ? (this.data = data) : null;
    error ? (this.error = error) : null;
  }
}
