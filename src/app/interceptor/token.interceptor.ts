import { HttpInterceptorFn } from '@angular/common/http';
import {jwtDecode} from "jwt-decode";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = sessionStorage.getItem("token")
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  })

  if(!req.url.includes('login') || req.url.includes('register')) {
    if (authToken) {
      const decodeToken = jwtDecode(authToken)
      const isValid =
        decodeToken && decodeToken.exp
          ? decodeToken.exp < Date.now() / 1000
          : false;
        if (isValid) {
          window.location.href = '/login'
        }
    }
  }
  return next(authReq);
};
