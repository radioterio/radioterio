import { ChannelContainer } from "@/views/channel/ChannelContainer";
import { getChannel, getChannelTracks, getUser } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const channelIdNum = parseInt(channelId, 10);

  if (isNaN(channelIdNum)) {
    notFound();
  }

  const [channel, initialTracks, user] = await Promise.all([
    getChannel(channelIdNum),
    getChannelTracks(channelIdNum, 0, 50),
    getUser(),
  ]);

  if (channel.type === "left" || initialTracks.type === "left" || user.type === "left") {
    notFound();
  }

  return (
    <ChannelContainer
      channel={channel.right}
      initialTracks={initialTracks.right}
      userId={user.right.id}
    />
  );
}
