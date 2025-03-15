import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/connect-to-db";
import { findUserByEmail } from "@/models/users";
import { IUser, IUserRole, PATHS } from "@/types";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    strategy: "jwt",
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(
            "INVALID_CREDENTIALS: Please provide email and password."
          );
        }

        try {
          // Connect to the database and ensure connection is established
          await connectToDatabase();

          // Finding the user using the email
          const user = await findUserByEmail(credentials.email, {
            includePassword: true,
            throwOn404: false,
          });

          // If the user is not found return null
          if (!user) {
            throw new Error(
              "USER_NOT_FOUND: If you don't have an account, please sign up."
            );
          }

          if (user.status === "inactive") {
            throw new Error("USER_INACTIVE: Your account is inactive.");
          }

          // Verify that the user password is correct
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.auth.password
          );

          // If the password is not correct return null
          if (!isPasswordValid) {
            throw new Error(
              "PASSWORD_MISMATCH: You entered an invalid password."
            );
          }

          // IMPORTANT: Return ALL necessary user properties here
          // These will be passed to the JWT callback
          return {
            id: user._id.toString(),
            email: user.auth.email,
            phoneNumber: user.phoneNumber,
            role: user.role || "user", // Include role with default value
            name: user.fullName.split(" ")[0] || user.auth.email.split("@")[0], // Provide a fallback name
          };
        } catch (error) {
          console.error("Authentication error:", error);
          if ((error as Error).message === "Failed to connect to database") {
            throw new Error(
              "DATABASE_ERROR: Unable to connect to the database. Please try again later."
            );
          }
          if ((error as Error).message.includes(":")) {
            throw error;
          }
          throw new Error(
            "SERVER_ERROR: An unexpected error occurred. Please try again later."
          );
        }
      },
    }),
  ],
  callbacks: {
    // JWT callback - Add data to the JWT token
    async jwt({ token, user }) {
      // When signing in, user object is available
      if (user) {
        const u = user as unknown as IUser;
        console.log("JWT Callback - User data:", user);

        // Add all user properties to the token
        token.id = user.id;
        token.email = user.email;
        token.role = u.role;
        token.phoneNumber = user.phoneNumber;
        token.name = user.name;

        // Log the token to verify data is being added
        console.log("JWT Callback - Token after adding user data:", token);
      }

      // Always return the token
      return token;
    },

    // Session callback - Add data from token to the session
    async session({ session, token }) {
      console.log("Session Callback - Token data:", token);

      // Ensure session.user exists
      if (!session.user) {
        // @ts-ignore
        session.user = {};
      }

      // Add token data to the session
      session.user.id = token.id;
      session.user.role = token.role as unknown as IUserRole;
      session.user.email = token.email;
      session.user.phoneNumber = token.phoneNumber;
      session.user.name = token.name;

      // Log the session to verify data is being added
      console.log(
        "Session Callback - Session after adding token data:",
        session
      );

      return session;
    },
  },
  pages: {
    signIn: PATHS.SIGNIN,
    error: PATHS.SIGNIN,
  },
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
});

export { handler as GET, handler as POST };
