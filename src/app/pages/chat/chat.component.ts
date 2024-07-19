import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ThemeServiceService} from "../../theme-service.service";
import {Router} from "@angular/router";
import {HttpHeaders} from "@angular/common/http";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";
import {ChatService} from "../../service/chat.service";
import {ChatRoom} from "../../model/chatRoom";
import {UserService} from "../../service/user.service";
import {MatDialog} from "@angular/material/dialog";
import {CreateNewRoomComponent} from "../create-new-room/create-new-room.component";
import {TextPipePipe} from "../../pipes/text-pipe.pipe";
import {TokenService} from "../../service/token.service";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    FormsModule,
    NgxSkeletonLoaderModule,
    TextPipePipe,
    NgIf,
    NgClass
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  message: string = '';
  messages: any[] = [];
  rooms: ChatRoom[] = [];
  user2Name: string = '';
  chat: boolean = false;
  filteredRooms = [...this.rooms];
  searchChatText: string = '';
  username: string = '';
  anotherUsername: string = '';
  currentUserId: string = '';
  anotherUserStatus: string = 'Online';
  private room: any;
  private stompClient: any;
  private currentSubscription: any;
  private userStatusSubscription: any;
  private token: string = '';
  selectedStatus: string = 'Online';
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef<HTMLDivElement>;

  constructor(private themeService: ThemeServiceService,
              private router: Router,
              private chatService: ChatService,
              private userService: UserService,
              private tokenService: TokenService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    if (token == null) {
      this.router.navigate(['/login']);
    }

    this.currentUserId = this.tokenService.decodeToken(token).id;
    this.themeService.setTheme(this.themeService.getTheme());
    this.username = this.tokenService.decodeToken(token).username;

    this.updateRooms();
    this.initConnection();
    this.join();
  }

  private initConnection() {
    const URL = '//localhost:8080/ws';
    const socket = new SockJS(URL);
    this.stompClient = Stomp.over(socket);
  }

  private join() {
    this.stompClient.connect({
      'Authorization': 'Bearer ' + this.token
    }, () => {
      this.chatService.changeUserStatus(this.currentUserId, "Online").subscribe(() => {
        this.sendUserStatus("Online");
      });
    }, (error: any) => {
      this.chatService.changeUserStatus(this.currentUserId, "Offline").subscribe(() => {
        this.sendUserStatus("Offline");
      });
    });

    this.stompClient.ws.onclose = () => {
      this.chatService.changeUserStatus(this.currentUserId, "Offline").subscribe(() => {
        this.sendUserStatus("Offline");
      });
    };
  }

  public sendUserStatus(status: string) {
    const statusMessage = {
      userId: this.currentUserId,
      status: status
    };
    this.stompClient.send("/app/status", {}, JSON.stringify(statusMessage));
  }

  onChangeStatus(event: any) {
    this.chatService.changeUserStatus(this.currentUserId, this.selectedStatus).subscribe(() => {
      this.sendUserStatus(this.selectedStatus);
    });
  }

  public manageChat(room: any) {
    this.chatService.deleteChatRoom(room.id).subscribe((result: any) => {
      console.log(result);
      this.updateRooms();
    });
  }

  public sendRoomMessage() {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    if (this.message.trim().length === 0) {
      alert('Your message must contain text');
      return;
    }
    const messageJSON = {
      content: this.message,
      timestamp: `${hours}:${minutes}`,
      senderId: this.currentUserId,
      chatRoomId: this.room.id,
      messageStatus: 'DELIVERED'
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.stompClient.send('/app/chat', { headers }, JSON.stringify(messageJSON));
    this.message = '';
  }

  openChat(room: any) {
    this.chat = true;
    const token = this.tokenService.getToken();
    const currentUser = this.tokenService.decodeToken(token).username;
    this.message = '';

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }

    if (room.user1Name === currentUser) {
      this.anotherUsername = room.user2Name;
      this.subscribeToUserStatusUpdates(room.user2Id);
    } else {
      this.anotherUsername = room.user1Name;
      this.subscribeToUserStatusUpdates(room.user1Id);
    }
    this.messages = [];
    this.room = room;
    console.log(room);
    this.user2Name = room.user2Name;
    this.showRoomMessages(room.id);
    console.log("SASKO " + room.id);
    this.currentSubscription = this.stompClient.subscribe('/user/' + room.id + '/queue/messages', (messages: any) => {
      this.messages.push(JSON.parse(messages.body));
    });
  }

  public subscribeToUserStatusUpdates(userId: string) {
    this.userStatusSubscription = this.stompClient.subscribe("/topic/userStatus/" + userId, (message: any) => {
      const statusUpdate = JSON.parse(message.body);
      this.anotherUserStatus = statusUpdate.status;
      console.log(`User ${statusUpdate.userId} is now ${statusUpdate.status}`);
    });
  }

  searchChat() {
    this.filteredRooms = this.rooms.filter((room) =>
      room.user2Name.toLowerCase().includes(this.searchChatText.toLowerCase())
    );
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private showRoomMessages(roomId: string) {
    this.chatService.getRoomMessages(roomId, this.currentUserId).subscribe((roomMessages) => {
      console.log(roomMessages);
      this.messages.push(...roomMessages);
      this.scrollToBottom();
    });
  }

  createRoom() {
    const dialogRef = this.dialog.open(CreateNewRoomComponent, {
      width: '1200px',
      height: '500px',
      data: {}
    });

    dialogRef.componentInstance.openChatEvent.subscribe((user2Id: string) => {
      this.chatService.createChatRoom(user2Id).subscribe((room: any) => {
        this.openChat(room);
        this.updateRooms();
      });
    });
  }

  private updateRooms() {
    this.chatService.getUserRooms().subscribe((rooms: any) => {
      const token = this.tokenService.getToken();
      const currentUser = this.tokenService.decodeToken(token).username;

      this.rooms = rooms.map((room: any) => {
        if (room.user1Name === currentUser) {
          room.anotherUsername = room.user2Name;
        } else {
          room.anotherUsername = room.user1Name;
        }
        return room;
      });

      this.filteredRooms = this.rooms;
    });
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
