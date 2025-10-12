import { ChannelTrack } from "../repo/channel-track.js";
import { Channel } from "../repo/channel.js";
import { User } from "../repo/user.js";

export const getTrackPath = (track: ChannelTrack) =>
  `audio/${track.hash[0]}/${track.hash[1]}/${track.hash}.${track.extension}`;

export const getCoverPath = (channel: Channel) => `covers/${channel.coverFile}`;

export const getAvatarPath = (user: User) => `avatars/${user.avatarFile}`;
