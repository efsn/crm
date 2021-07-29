import {
  Global,
  Module,
  HttpService as HttpServiceDelegate,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export default class HttpService {
  constructor(private readonly httpServiceDelegate: HttpServiceDelegate) {}
  error<T = any>() {
    return (source: Observable<AxiosResponse<T>>) => {
      return source.pipe(
        catchError((error) => {
          const { response, code, errno } = error;
          if (response) {
            const { data, status } = response;
            throw new HttpException(data, status);
          }
          throw new InternalServerErrorException(code, errno);
        }),
      );
    };
  }
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const { error } = this;
    return new Promise<AxiosResponse<T>>((resolve) => {
      this.httpServiceDelegate
        .request(config)
        .pipe(
          map((data) => {
            resolve(data);
            return data;
          }),
        )
        .pipe(error());
    });
  }
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return axios
      .get<T>(url, config)
      .then((res) => res.data)
      .catch<T>((error) => {
        const { response, code, errno } = error;
        if (response) {
          const { data, status } = response;
          throw new HttpException(data, status);
        }
        throw new InternalServerErrorException(code, errno);
      });
  }
}
