import {Message} from "./message";

export interface ChatRoom {
  id: string;
  user1Name: string;
  user2Name: string;
  user1Id: string;
  user2Id: string;
  messages?: Message[];
  anotherUsername?: string;
}
