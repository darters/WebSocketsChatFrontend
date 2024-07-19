import { Routes } from '@angular/router';
import {RegistrationComponent} from "./auth/registration/registration.component";
import {ChatComponent} from "./pages/chat/chat.component";
import {LoginComponent} from "./auth/login/login.component";
import {CreateNewRoomComponent} from "./pages/create-new-room/create-new-room.component";

export const routes: Routes = [
  {path: 'create-room', component: CreateNewRoomComponent},
  {path: 'registration', component: RegistrationComponent},
  {path: 'login', component: LoginComponent},
  {path: '', component:ChatComponent}
];
