export interface IResponseSchema<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}
