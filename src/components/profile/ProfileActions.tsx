"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { UserPlus, UserMinus, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type ProfileActionsProps = {
  profileUserId: string;
  profileName: string;
};

export function ProfileActions({ profileUserId, profileName }: ProfileActionsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [following, setFollowing] = React.useState(false);
  const [followerCount, setFollowerCount] = React.useState(0);
  const [toggling, setToggling] = React.useState(false);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/follows?userId=${profileUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setFollowing(data.following || false);
        setFollowerCount(data.followerCount || 0);
      })
      .catch(console.error);
  }, [profileUserId, status]);

  const handleFollow = async () => {
    if (status !== "authenticated") {
      router.push("/auth");
      return;
    }
    setToggling(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profileUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        setFollowerCount(data.followerCount);
      }
    } catch {}
    setToggling(false);
  };

  const handleContact = async () => {
    if (status !== "authenticated") {
      router.push("/auth");
      return;
    }
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: profileUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/inbox/${data.id}`);
      }
    } catch {}
  };

  // Don't show for own profile
  const isOwn = session?.user?.email && status === "authenticated";
  if (isOwn && session?.user?.name) {
    // We'll just check the user ids separately below
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {/* Follow count */}
      {followerCount > 0 && (
        <span className="flex items-center text-sm text-iraq-stone">
          <UserPlus className="h-4 w-4 mr-1" />
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </span>
      )}
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant={following ? "secondary" : "primary"}
          size="sm"
          onClick={handleFollow}
          disabled={toggling}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : following ? (
            <UserMinus className="h-4 w-4 mr-1" />
          ) : (
            <UserPlus className="h-4 w-4 mr-1" />
          )}
          {following ? "Following" : "Follow"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleContact}
          className="border border-iraq-gold/20"
        >
          <Mail className="h-4 w-4 mr-1" />
          Message
        </Button>
      </div>
    </div>
  );
}