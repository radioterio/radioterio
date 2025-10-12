import React from "react";
import { Either } from "@/common/either-lite";
import { UserResponse } from "@/app/actions";
import Image from "next/image";

interface ProfileContainerProps {
  readonly user: Either<unknown, UserResponse>;
}

export const ProfileContainer: React.FC<ProfileContainerProps> = ({ user }) => {
  switch (user.type) {
    case "right": {
      return (
        <div>
          <div>Profile</div>
          <div>
            {user.right.avatarFileUrl ? (
              <Image width={128} height={128} alt={"avatar"} src={user.right.avatarFileUrl}></Image>
            ) : (
              <div>No avatar</div>
            )}
          </div>
          <div>{user.right.email}</div>
          <div>
            <div>Stats</div>
            <div>
              <div>Channels</div>
              <div>{user.right.stats.channelCount}</div>
            </div>
            <div>
              <div>Tracks</div>
              <div>{user.right.stats.trackCount}</div>
            </div>
          </div>
        </div>
      );
    }

    case "left": {
      return (
        <>
          <div>Error</div>
          <pre>{JSON.stringify(user.left, null, 2)}</pre>
        </>
      );
    }
  }
};
