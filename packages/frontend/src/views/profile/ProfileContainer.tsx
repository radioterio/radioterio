"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Either } from "@/common/either-lite";
import { logout, UserResponse, Channel } from "@/app/actions";
import { getStatusColor } from "@/common/status-color";
import { UnderConstruction } from "@/components/UnderConstruction/UnderConstruction";

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
            {JSON.stringify(user.type === "left" ? user.left : channels.left, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const { avatarFileUrl, email } = user.right;
  const channelsList = channels.right;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:grid md:grid-cols-2 md:h-screen">
        {/* Left panel - Channels list */}
        <section className="md:border-r md:border-gray-200 md:overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Channels</h2>
              <button
                onClick={handleLogoutClick}
                className="text-sm text-gray-600 px-3 py-1 rounded"
              >
                Log out
              </button>
            </div>

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

        {/* Right panel - Under construction */}
        <section className="hidden md:flex md:bg-gray-100">
          <UnderConstruction />
        </section>
      </div>

      {/* Mobile: Under construction section below channels */}
      <section className="md:hidden border-t border-gray-200 bg-gray-100" style={{ minHeight: "200px" }}>
        <UnderConstruction />
      </section>
    </div>
  );
};
