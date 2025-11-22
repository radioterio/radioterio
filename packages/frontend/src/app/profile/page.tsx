import { ProfileContainer } from "@/views/profile/ProfileContainer";
import { getUser, getChannels } from "@/app/actions";

export default async function Profile() {
  const [user, channels] = await Promise.all([getUser(), getChannels()]);

  return <ProfileContainer user={user} channels={channels} />;
}
