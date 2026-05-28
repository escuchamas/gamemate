import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string | null;
    emailVerified?: Date | null;
    phoneVerified?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username?: string | null;
      emailVerified?: Date | null;
      phoneVerified?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    emailVerified?: Date | null;
    phoneVerified?: boolean;
  }
}
