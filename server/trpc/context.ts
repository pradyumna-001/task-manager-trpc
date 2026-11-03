import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export interface Context {}

export async function createContext(
  opts: CreateNextContextOptions
): Promise<Context> {
  return {};
}
