"use server";

import z from "zod";
import { cookies } from "next/headers";

import { Either, left, right } from "@/common/either-lite";
import { ServerError } from "@/errors/server-error";
import { ParseError } from "@/errors/parse-error";

const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;

const LoginResponseSchema = z.object({
  accessToken: z.string(),
});

export async function loginAction(
  email: string,
  password: string,
): Promise<Either<ServerError | ParseError, void>> {
  const c = await cookies();
  const res = await fetch(`${API_SERVER_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    return left(new ServerError(res.status, await res.text()));
  }

  const json = await res.json();
  const result = LoginResponseSchema.safeParse(json);

  if (!result.success) {
    throw new ParseError(result.error.issues.map((issue) => issue.message));
  }

  c.set("accessToken", result.data.accessToken, { httpOnly: true });

  return right(undefined);
}

const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  avatarFileUrl: z.string().nullable(),
  stats: z.object({
    channelCount: z.number(),
    trackCount: z.number(),
  }),
});

export type UserResponse = z.TypeOf<typeof UserResponseSchema>;

export async function getUser(): Promise<Either<ServerError | ParseError, UserResponse>> {
  const c = await cookies();
  const accessTokenCookie = c.get("accessToken");

  const res = await fetch(`${API_SERVER_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessTokenCookie?.value}`,
    },
  });

  if (!res.ok) {
    return left(new ServerError(res.status, await res.text()));
  }

  const json = await res.json();
  const result = UserResponseSchema.safeParse(json);

  if (!result.success) {
    throw new ParseError(result.error.issues.map((issue) => issue.message));
  }

  return right(result.data);
}
