interface IResponseResultData {
  [key: string]: any;
}
interface IResponseResult {
  statusCode: number | string;
  code?: string;
  message?: string;
  data?: IResponseResultData;
}
