import type { ImageSourcePropType } from "react-native";

export type SocialSoftButtonProps = {
  title: string;
  sub?: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "neutral" | "danger" | "good";
  powerGate?: boolean;
};

export type SocialImageSource = ImageSourcePropType;

export type SocialPost = {
  id: string;
  user_id?: string;
  username: string;
  body: string;
  badges?: string[];
  likes_count?: number;
  comments_count?: number;
  favorites_count?: number;
  liked?: boolean;
  favorited?: boolean;
  following?: boolean;
  role?: string;
  verified?: boolean;
  snapshot?: string;
};

export type SocialPoll = {
  id: string;
  question: string;
  options: string[];
  counts?: number[];
  closes_at?: string;
  created_at?: string;
  edited_at?: string;
  username?: string;
  user_id?: string;
  badges?: string[];
  poll_type?: "single" | "multi" | "quiz";
  allow_multiple?: boolean;
  correct_index?: number | null;
};

export type SocialComment = {
  id: string;
  username: string;
  body: string;
  badges?: string[];
};

export type SocialProfileSummary = {
  id: string;
  username: string;
  role?: string;
  badges?: string[];
  last_body?: string;
  last_at?: string;
  last_from_id?: string;
  unread_count?: number;
};

export type SocialRecentItem = {
  id: string;
  type: "post" | "profile";
  label: string;
  ts: number;
};

export type SocialFeedProps = {
  profileSearch: string;
  feedSearch: string;
  postBody: string;
  posts: SocialPost[];
  socialLoading: boolean;
  profileResults: SocialProfileSummary[];
  commentsByPost: Record<string, SocialComment[]>;
  commentDrafts: Record<string, string>;
  commentReplyTo: Record<string, string | null>;
  authToken?: string;
  isWide: boolean;
  isMid: boolean;
  isAdmin: boolean;
  authUserId?: string;
  authUsername?: string;
  authBadges?: string[];
  recents: SocialRecentItem[];
  polls: SocialPoll[];
  badgeMeta?: Record<string, { id: string; name: string; type: "emoji" | "image" | "icon"; value: string }>;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  onProfileSearchChange: (value: string) => void;
  onFeedSearchChange: (value: string) => void;
  onPostBodyChange: (value: string) => void;
  onCreatePost: () => void;
  onFollowToggle: (post: SocialPost) => void;
  onLikeToggle: (postId: string) => void;
  onFavoriteToggle: (postId: string) => void;
  onFetchComments: (postId: string) => void;
  onAddComment: (postId: string) => void;
  onCommentDraftChange: (postId: string, value: string) => void;
  onSetCommentReplyTo: (postId: string, commentId: string | null) => void;
  onOpenProfile: (username: string) => void;
  onAddRecent: (item: SocialRecentItem) => void;
  onRemoveRecent: (id: string) => void;
  onCreatePoll: (question: string, options: string[], pollType: "single" | "multi" | "quiz", correctIndex: number | null) => void;
  onVotePoll: (pollId: string, optionIndex: number) => void;
  onDeletePoll?: (pollId: string) => void;
  onEditPoll?: (pollId: string, question: string, options: string[], pollType: "single" | "multi" | "quiz", correctIndex: number | null) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string, body: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onBack: () => void;
  onNavHome: () => void;
  onNavMessages: () => void;
  onNavExplore: () => void;
  onNavSettings: () => void;
};

export type SocialProfileProps = {
  profileView: any;
  profileFollowers: number;
  profileFollowing: number;
  profileStats: any;
  profileFeatured: string[];
  profileBadges?: string[];
  badgeMeta?: Record<
    string,
    { id: string; name: string; type: "emoji" | "image" | "icon"; value: string }
  >;
  profileIsFollowing: boolean;
  profileIsFriend: boolean;
  profileLikedPosts: SocialPost[];
  profileFavoritePosts: SocialPost[];
  profilePosts: SocialPost[];
  profilePolls?: SocialPoll[];
  achievementMeta?: Record<string, { id: string; name: string; tier: string }>;
  authUser?: any;
  authToken?: string;
  bannerSource?: ImageSourcePropType;
  backgroundSource?: ImageSourcePropType;
  dmDraft: string;
  dmMessages: SocialComment[];
  isAdmin: boolean;
  onBack: () => void;
  onFollowToggle: () => void;
  onRefreshProfile: () => void;
  onLoadProfileMessages: () => void;
  onDmDraftChange: (value: string) => void;
  onSendMessage: () => void;
  onAdminAction: (action: "admin" | "user" | "verify" | "unverify") => void;
};

export type SocialMessagesProps = {
  profileResults: SocialProfileSummary[];
  messageUser: any;
  dmMessages: SocialComment[];
  dmDraft: string;
  messageSearch: string;
  authUsername?: string;
  isAdmin: boolean;
  badgeMeta?: Record<string, { id: string; name: string; type: "emoji" | "image" | "icon"; value: string }>;
  onDeleteMessage: (id: string) => void;
  onEditMessage: (id: string, body: string) => void;
  onMessageSearchChange: (value: string) => void;
  onSelectMessageUser: (profile: SocialProfileSummary) => void;
  onDmDraftChange: (value: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
};
