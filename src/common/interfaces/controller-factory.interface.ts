import { ResponseSchemaObj } from '../types/response-schema.type';
export interface IControllerFactory {
  healthCheck: () => Promise<ResponseSchemaObj<boolean>>;
}
