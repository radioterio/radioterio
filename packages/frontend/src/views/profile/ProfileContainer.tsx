"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Either } from "@/common/either-lite";
import { logout, UserResponse } from "@/app/actions";

interface ProfileContainerProps {
  readonly user: Either<unknown, UserResponse>;
}

export const ProfileContainer: React.FC<ProfileContainerProps> = ({ user }) => {
  const router = useRouter();

  const handleLogoutClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("logout clock");
    e.preventDefault();
    try {
      await logout();
      return router.replace("/login");
    } catch {
      //
    }
  };

  switch (user.type) {
    case "right": {
      const { avatarFileUrl, email, stats } = user.right;
      return (
        <div className="relative min-h-screen flex items-start md:items-center justify-center">
          <div className="absolute inset-0 bg-linear-to-br from-pink-500 to-yellow-500 opacity-5"></div>
          <div className="relative px-8 py-10 w-full max-w-md flex flex-col items-center">
            {/* Avatar */}
            <div className="mb-6">
              {avatarFileUrl ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg flex items-center justify-center bg-gray-50">
                  <Image
                    width={128}
                    height={128}
                    alt="avatar"
                    src={avatarFileUrl}
                    className="object-cover w-32 h-32"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full flex items-center justify-center text-gray-100 text-lg font-medium border-4 border-gray-200 shadow-lg">
                  No avatar
                </div>
              )}
            </div>
            {/* Email */}
            <div className="mb-8 text-center">
              <div className="text-md font-light">{email}</div>
            </div>
            {/* Stats */}
            <div className="w-full">
              <div className="font-semibold text-center mb-4">Stats</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="py-5 flex flex-col items-center">
                  <div className="text-xs uppercase tracking-wide mb-1">Channels</div>
                  <div className="text-2xl font-bold">{stats.channelCount}</div>
                </div>
                <div className="py-5 flex flex-col items-center">
                  <div className="text-xs uppercase tracking-wide mb-1">Tracks</div>
                  <div className="text-2xl font-bold">{stats.trackCount}</div>
                </div>
              </div>
            </div>
            <button
              className="mt-8 w-full h-12 rounded-2xl border px-4 py-2 font-medium text-gray-800 bg-white hover:bg-gray-200 transition-colors"
              onClick={handleLogoutClick}
            >
              Log out
            </button>
          </div>
        </div>
      );
    }
    case "left": {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 via-white to-gray-200">
          <div className="bg-white/80 rounded-xl shadow-lg px-8 py-10 w-full max-w-md flex flex-col items-center">
            <div className="text-red-600 font-semibold mb-2">Error</div>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap">
              {JSON.stringify(user.left, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  }
  return null;
};
