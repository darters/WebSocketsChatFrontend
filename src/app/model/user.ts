export interface User {
  id?: string;
  username: string;
  password: string;
  status?: userStatus;
  anotherUserStatus?: any;
}

export enum userStatus {
  Offline,
  Online
}
