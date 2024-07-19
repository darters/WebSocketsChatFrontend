import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {User} from "../model/user";
import {catchError, Observable, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) {
  }
  authUrl = 'http://localhost:8080/auth/'
  userUrl = "http://localhost:8080/userController/"
  public login(user: User): Observable<any> {
    return this.createAuthRequest(user, 'login')
  }
  public registration(user: User): Observable<any> {
    return this.createAuthRequest(user, 'registration')
  }
  public getAllUsers(): Observable<any> {
    return this.httpClient.get<any[]>(this.userUrl + 'getAll')
  }

  private createAuthRequest(user: User, operation: string): Observable<any> {
    const userJson = JSON.stringify(user);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    return this.httpClient.post(this.authUrl + operation, userJson, { headers, responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(error);
        })
      );
  }
}
