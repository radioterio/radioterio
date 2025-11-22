import { ChannelContainer } from "@/views/channel/ChannelContainer";
import { getChannel, getChannelTracks } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const channelIdNum = parseInt(channelId, 10);

  if (isNaN(channelIdNum)) {
    notFound();
  }

  const [channel, initialTracks] = await Promise.all([
    getChannel(channelIdNum),
    getChannelTracks(channelIdNum, 0, 50),
  ]);

  if (channel.type === "left" || initialTracks.type === "left") {
    notFound();
  }

  return (
    <ChannelContainer
      channel={channel.right}
      initialTracks={initialTracks.right}
    />
  );
}

