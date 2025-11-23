import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      userId?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    id?: string;
    userId?: string;
    email?: string;
    name?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    userId?: string;
  }
}
