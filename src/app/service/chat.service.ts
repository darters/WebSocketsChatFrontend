import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private httpClient: HttpClient) {
  }
  private url: string = 'http://localhost:8080/'

  public createChatRoom(userId: string): Observable<any> {
    return this.httpClient.post(this.url + 'chatRoom/create', {user2Id: userId})
  }
  public deleteChatRoom(chatRoomId: string): Observable<any> {
    return this.httpClient.delete(this.url + 'chatRoom/delete/' + chatRoomId, { responseType: 'text' });
  }
  public getUserRooms(): any {
    return this.httpClient.get(this.url + 'chatRoom/get')
  }
  public getRoomMessages(chatId: string, openerId: string) {
    return this.httpClient.get<any[]>(this.url + 'chatRoom/messages/' + chatId, { params: {'openerId': openerId} })
  }
  public changeUserStatus(userId: string, status: string) {
    const changeStatusRequest = {
      userId: userId,
      status: status
    }
    return this.httpClient.post(this.url + 'userController/changeStatus', changeStatusRequest, {responseType: 'text'})
  }
}
