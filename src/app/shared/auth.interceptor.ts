import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('biz-token');
  if (token) {
    // alert("Interceptor Active");
    req = req.clone({
      setHeaders: {
        Authorization: `${token}`
      }
    });
  }
  return next(req);
};
