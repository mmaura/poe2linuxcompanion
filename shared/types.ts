export interface Message {
  date: Date;
  message: string;
  direction: 'from' | 'to';
  unread: boolean;
}
export interface BUYER {
  id: string;
  date: Date;
  direction: 'buy' | 'sell';
  playername: string;
  playerIsHere: boolean;
  price: {
    quantity: number;
    currency: string; //path
  };
  objet: string;
  league: string;
  tab: string;
  xpos: number;
  ypos: number;
  messages: Message[];
}
