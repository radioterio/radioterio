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

  c.set("accessToken", result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return right(undefined);
}

export async function logout() {
  const c = await cookies();

  c.delete("accessToken");
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

const ChannelStatusSchema = z.enum(["Stopped", "Started", "Paused", "Unknown"]);

const ChannelSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: ChannelStatusSchema,
  coverFileUrl: z.string().nullable(),
  coverBackgroundColor: z.string().nullable(),
});

export type Channel = z.TypeOf<typeof ChannelSchema>;

export async function getChannels(): Promise<Either<ServerError | ParseError, Channel[]>> {
  const c = await cookies();
  const accessTokenCookie = c.get("accessToken");

  const res = await fetch(`${API_SERVER_URL}/channels`, {
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
  const result = z.array(ChannelSchema).safeParse(json);

  if (!result.success) {
    throw new ParseError(result.error.issues.map((issue) => issue.message));
  }

  return right(result.data);
}

const ChannelResponseSchema = ChannelSchema.extend({
  totalTrackCount: z.number(),
});

export type ChannelResponse = z.TypeOf<typeof ChannelResponseSchema>;

export async function getChannel(
  channelId: number,
): Promise<Either<ServerError | ParseError, ChannelResponse>> {
  const c = await cookies();
  const accessTokenCookie = c.get("accessToken");

  const res = await fetch(`${API_SERVER_URL}/channels/${channelId}`, {
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
  const result = ChannelResponseSchema.safeParse(json);

  if (!result.success) {
    throw new ParseError(result.error.issues.map((issue) => issue.message));
  }

  return right(result.data);
}

const ChannelTrackSchema = z.object({
  id: z.number(),
  filename: z.string(),
  extension: z.string(),
  title: z.string(),
  artist: z.string(),
  duration: z.number(),
  trackUrl: z.string(),
});

export type ChannelTrack = z.TypeOf<typeof ChannelTrackSchema>;

export async function getChannelTracks(
  channelId: number,
  offset: number = 0,
  limit: number = 50,
): Promise<Either<ServerError | ParseError, ChannelTrack[]>> {
  const c = await cookies();
  const accessTokenCookie = c.get("accessToken");

  const res = await fetch(
    `${API_SERVER_URL}/channels/${channelId}/tracks?offset=${offset}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessTokenCookie?.value}`,
      },
    },
  );

  if (!res.ok) {
    return left(new ServerError(res.status, await res.text()));
  }

  const json = await res.json();
  const result = z.array(ChannelTrackSchema).safeParse(json);

  if (!result.success) {
    throw new ParseError(result.error.issues.map((issue) => issue.message));
  }

  return right(result.data);
}

const NowPlayingSchema = z.object({
  channel: z.object({
    title: z.string(),
    status: ChannelStatusSchema,
  }),
  track: z.object({
    filename: z.string(),
    title: z.string(),
    artist: z.string(),
    duration: z.number(),
    trackUrl: z.string(),
  }),
  position: z.number(),
});

export type NowPlaying = z.TypeOf<typeof NowPlayingSchema>;

export async function getNowPlaying(
  channelId: number,
  timestamp: number,
): Promise<Either<ServerError | ParseError, NowPlaying>> {
  const c = await cookies();
  const accessTokenCookie = c.get("accessToken");

  const res = await fetch(
    `${API_SERVER_URL}/channels/${channelId}/now-playing-at/${timestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessTokenCookie?.value}`,
      },
    },
  );

  if (!res.ok) {
    return left(new ServerError(res.status, await res.text()));
  }

  const json = await res.json();
  const result = NowPlayingSchema.safeParse(json);

  if (!result.success) {
    throw new ParseError(result.error.issues.map((issue) => issue.message));
  }

  return right(result.data);
}
