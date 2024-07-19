import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }
  public decodeToken(token: any) {
    if (token) {
      const tokenParts = token.split('.');

      const encodedPayload = tokenParts[1];
      const decodedPayload = atob(encodedPayload);

      const payload = JSON.parse(decodedPayload);

      return payload;
    }
  }
  public getToken() {
    return sessionStorage.getItem('token')
  }
}
