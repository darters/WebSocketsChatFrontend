import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {UserService} from "../../service/user.service";
import {NgForOf} from "@angular/common";
import {User} from "../../model/user";
import {ChatService} from "../../service/chat.service";
import {TextPipePipe} from "../../pipes/text-pipe.pipe";
import {TokenService} from "../../service/token.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-create-new-room',
  standalone: true,
  imports: [
    NgForOf,
    TextPipePipe
  ],
  templateUrl: './create-new-room.component.html',
  styleUrl: './create-new-room.component.scss'
})
export class CreateNewRoomComponent implements OnInit {
  users: User[] = []
  currentUserId: string = ''
  @Output() openChatEvent = new EventEmitter<string>()
  constructor(private userService: UserService,
                private chatService: ChatService,
                private tokenService: TokenService,
                private dialogRef: MatDialogRef<CreateNewRoomComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { token: string }) {
    }

  ngOnInit(): void {
    const token = this.tokenService.getToken()
    const decodedToken = this.tokenService.decodeToken(token);
    this.currentUserId = decodedToken.id;

      this.userService.getAllUsers().subscribe((users) => {
        // @ts-ignore
        this.users = users.filter(user => user.id !== this.currentUserId);
      });
  }
  openChat(user: User) {
    // @ts-ignore
    let user2Id: string = user.id.toString()
    this.chatService.createChatRoom(user2Id).subscribe((message: any) => {
      this.openChatEvent.emit(user2Id)
      this.dialogRef.close()
      console.log(message)
    })
  }
}
