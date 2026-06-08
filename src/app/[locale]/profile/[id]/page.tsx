"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  MapPin, Globe, Calendar, Star, Link as LinkIcon,
  Loader2, Image as ImageIcon, User, Users, FileText,
  Verified, MoreHorizontal
} from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { ProfileActions } from "@/components/profile/ProfileActions";

type ProfileData = {
  id: string;
  displayName: string | null;
  bio: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  governorate: string | null;
  languages: string[];
  interests: string[];
  diasporaStatus: string | null;
  verificationStatus: string | null;
  phone: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
};

type PostData = {
  id: string;
  content: string;
  media: string[];
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  likes: number;
  comments: number;
  liked: boolean;
  recentComments: any[];
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

const GOVERNORATES: Record<string, string> = {
  "Baghdad": "بغداد", "Basra": "البصرة", "Erbil": "أربيل", "Sulaymaniyah": "السليمانية",
  "Duhok": "دهوك", "Mosul": "الموصل", "Kirkuk": "كركوك", "Najaf": "النجف",
  "Karbala": "كربلاء", "Hillah": "الحلة", "Diwaniyah": "الديوانية", "Nasiriyah": "الناصرية",
  "Amarah": "العمارة", "Samawah": "السماوة", "Fallujah": "الفلوجة", "Ramadi": "الرمادي",
  "Tikrit": "تكريت", "Baqubah": "بعقوبة", "Kut": "الكوت", "Zakho": "زاخو"
};

export default function ProfilePage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"posts" | "photos" | "about">("posts");
  const [followStats, setFollowStats] = React.useState({ followerCount: 0, followingCount: 0 });

  const profileId = params.id as string;

  React.useEffect(() => {
    if (!profileId) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/detail?id=${profileId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setPosts(data.posts || []);
          setFollowStats({
            followerCount: data.followerCount || 0,
            followingCount: data.followingCount || 0,
          });
        }
      } catch (err) {
        console.error("[profile] fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  const handleLike = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, liked: data.liked, likes: data.likes } : p))
    );
  };

  const handleComment = async (postId: string, content: string) => {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return;
    const comment = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments + 1, recentComments: [...p.recentComments, comment] }
          : p
      )
    );
  };

  const handleDelete = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-iraq-cream px-4">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-iraq-gold/30 mb-4" />
          <h1 className="text-xl font-bold text-iraq-navy">Profile not found</h1>
        </div>
      </div>
    );
  }

  const name = profile.displayName || profile.user.name || "Anonymous";
  const userId = (session as any)?.user?.id;
  const isOwn = userId === profileId;
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" });

  // Collect all images from posts
  const allImages = posts.flatMap((p) => p.media);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream">
      {/* ===== COVER ===== */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-iraq-navy to-iraq-navy-dark overflow-hidden">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 mesopotamian-pattern opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-iraq-navy/60 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ===== PROFILE HEADER ===== */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-6">
          {/* Avatar */}
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-iraq-gold to-amber-600 text-white text-2xl font-bold shadow-xl">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              getInitials(name)
            )}
          </div>

          {/* Name + actions */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white drop-shadow-sm">{name}</h1>
              {profile.verificationStatus === "verified" && (
                <Verified className="h-5 w-5 text-blue-400 fill-blue-400" />
              )}
            </div>
            {profile.profession && (
              <p className="text-sm text-white/80 mt-0.5">{profile.profession}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-white/60">
              {profile.city && profile.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.city}, {profile.country}
                </span>
              )}
              {profile.governorate && (
                <span className="flex items-center gap-1">
                  🏛️ From {profile.governorate}{GOVERNORATES[profile.governorate] ? ` (${GOVERNORATES[profile.governorate]})` : ""}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Member since {memberSince}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 mt-3">
              <div className="text-center">
                <p className="text-sm font-bold text-white">{posts.length}</p>
                <p className="text-[10px] text-white/60">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{followStats.followerCount}</p>
                <p className="text-[10px] text-white/60">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{followStats.followingCount}</p>
                <p className="text-[10px] text-white/60">Following</p>
              </div>
            </div>

            {/* Actions */}
            {!isOwn && (
              <div className="mt-3">
                <ProfileActions profileUserId={profileId} profileName={name} />
              </div>
            )}
          </div>
        </div>

        {/* ===== BIO CARD ===== */}
        {profile.bio && (
          <div className="mb-6 rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* ===== TABS ===== */}
        <div className="mb-6 flex items-center gap-1 p-1 bg-white rounded-xl border border-iraq-sand/20 shadow-sm">
          {[
            { id: "posts" as const, label: "Posts", icon: FileText },
            { id: "photos" as const, label: "Photos", icon: ImageIcon },
            { id: "about" as const, label: "About", icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-iraq-navy to-iraq-navy-light text-white shadow-md"
                  : "text-stone-600 hover:text-iraq-navy"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== POSTS TAB ===== */}
        {activeTab === "posts" && (
          <div className="space-y-4 pb-8">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-iraq-sand/30 bg-white p-12 text-center shadow-sm">
                <FileText className="mx-auto h-10 w-10 text-iraq-gold/30 mb-3" />
                <p className="text-sm text-iraq-stone">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDelete={isOwn ? handleDelete : undefined}
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        )}

        {/* ===== PHOTOS TAB ===== */}
        {activeTab === "photos" && (
          <div className="pb-8">
            {allImages.length === 0 ? (
              <div className="rounded-2xl border border-iraq-sand/30 bg-white p-12 text-center shadow-sm">
                <ImageIcon className="mx-auto h-10 w-10 text-iraq-gold/30 mb-3" />
                <p className="text-sm text-iraq-stone">No photos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block aspect-square rounded-xl overflow-hidden bg-stone-100"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ABOUT TAB ===== */}
        {activeTab === "about" && (
          <div className="pb-8 space-y-4">
            <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-iraq-navy mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-iraq-gold" /> About
              </h3>
              <div className="space-y-3 text-sm text-stone-600">
                {profile.governorate && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏛️</span>
                    <span><strong>From:</strong> {profile.governorate}</span>
                  </div>
                )}
                {profile.city && profile.country && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <span><strong>Location:</strong> {profile.city}, {profile.country}</span>
                  </div>
                )}
                {profile.languages && profile.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <span><strong>Languages:</strong> {profile.languages.join(", ")}</span>
                  </div>
                )}
                {profile.diasporaStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌍</span>
                    <span><strong>Status:</strong> {
                      profile.diasporaStatus === "first_gen" ? "First generation"
                      : profile.diasporaStatus === "second_gen" ? "Second generation"
                      : "Friend of Iraq"
                    }</span>
                  </div>
                )}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="rounded-full bg-iraq-gold/10 px-3 py-1 text-xs text-iraq-gold-dark font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-iraq-navy mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-iraq-gold" /> Bio
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}