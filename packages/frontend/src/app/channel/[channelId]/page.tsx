import { ChannelContainer } from "@/views/channel/ChannelContainer";
import { getChannel, getChannelTracks, getUser, getConfig } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const channelIdNum = parseInt(channelId, 10);

  if (isNaN(channelIdNum)) {
    notFound();
  }

  const [channel, initialTracks, user, configResult] = await Promise.all([
    getChannel(channelIdNum),
    getChannelTracks(channelIdNum, 0, 50),
    getUser(),
    getConfig(),
  ]);

  if (channel.type === "left" || initialTracks.type === "left" || user.type === "left") {
    notFound();
  }

  const playbackServerUrl =
    configResult.type === "right" ? configResult.right.playbackServerUrl : null;

  return (
    <ChannelContainer
      channel={channel.right}
      initialTracks={initialTracks.right}
      userId={user.right.id}
      playbackServerUrl={playbackServerUrl}
    />
  );
}
