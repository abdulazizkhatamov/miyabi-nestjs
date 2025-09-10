import 'express-session';

declare module 'express-session' {
  interface SessionData {
    admin?: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    };
  }
}
