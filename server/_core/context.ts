import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Public access mode - create a mock user from environment variables
    const ownerName = process.env.OWNER_NAME || 'Guest User';
    const ownerOpenId = process.env.OWNER_OPEN_ID || 'public-user';
    
    user = {
      id: 1,
      openId: ownerOpenId,
      name: ownerName,
      email: null,
      loginMethod: 'public',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
