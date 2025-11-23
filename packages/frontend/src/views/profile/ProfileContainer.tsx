"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Either } from "@/common/either-lite";
import { logout, UserResponse, Channel } from "@/app/actions";
import { getStatusColor } from "@/common/status-color";

interface ProfileContainerProps {
  readonly user: Either<unknown, UserResponse>;
  readonly channels: Either<unknown, Channel[]>;
}

export const ProfileContainer: React.FC<ProfileContainerProps> = ({ user, channels }) => {
  const router = useRouter();

  const handleLogoutClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await logout();
      return router.replace("/login");
    } catch {
      //
    }
  };

  const handleChannelClick = (channelId: number) => {
    router.push(`/channel/${channelId}`);
  };

  if (user.type === "left" || channels.type === "left") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 px-8 py-10 w-full max-w-md flex flex-col items-center">
          <div className="text-red-600 font-semibold mb-2">Error</div>
          <pre className="text-xs text-gray-500 whitespace-pre-wrap">
            {JSON.stringify(
              user.type === "left" ? user.left : channels.type === "left" ? channels.left : null,
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    );
  }

  const { avatarFileUrl, email, stats } = user.right;
  const channelsList = channels.right;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:grid md:grid-cols-2 md:h-screen flex flex-col md:flex-row">
        {/* Left panel - Profile info (top on mobile) */}
        <section className="md:border-r md:border-gray-200 md:overflow-y-auto bg-white border-b md:border-b-0 border-gray-200">
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              {avatarFileUrl ? (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                  <Image src={avatarFileUrl} alt="avatar" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-lg flex items-center justify-center text-gray-400 bg-gray-50">
                  No avatar
                </div>
              )}
            </div>

            {/* Email */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{email}</h1>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Channels:</span>
                  <span className="font-medium text-gray-900">{stats.channelCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracks:</span>
                  <span className="font-medium text-gray-900">{stats.trackCount}</span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="flex justify-center">
              <button
                className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium"
                onClick={handleLogoutClick}
              >
                Log out
              </button>
            </div>
          </div>
        </section>

        {/* Right panel - Channels list */}
        <section className="md:overflow-y-auto bg-gray-50">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Channels</h2>

            {channelsList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No channels yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {channelsList.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelClick(channel.id)}
                    className="w-full p-4 rounded-lg border border-gray-200 bg-white text-left"
                  >
                    <div className="flex items-center gap-4">
                      {channel.coverFileUrl ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={channel.coverFileUrl}
                            alt={channel.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs"
                          style={{
                            backgroundColor: channel.coverBackgroundColor || "#f3f4f6",
                          }}
                        >
                          No cover
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{channel.title}</h3>
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                              channel.status,
                            )}`}
                            title={channel.status}
                          />
                        </div>
                        <p className="text-sm text-gray-500">{channel.status}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
