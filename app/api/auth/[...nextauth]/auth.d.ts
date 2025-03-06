import { IUserRole } from "@/types";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phoneNumber?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: IUserRole;
    };
  }

  interface User {
    id: string;
    phoneNumber?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phoneNumber?: string;
  }
}
