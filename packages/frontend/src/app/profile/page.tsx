import { ProfileContainer } from "@/views/profile/ProfileContainer";
import { getUser } from "@/app/actions";

export default async function Profile() {
  const user = await getUser();

  return <ProfileContainer user={user} />;
}
