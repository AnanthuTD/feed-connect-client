import { UUID } from "crypto";

export interface UserState {
	username: string;
	fullName: string;
	email: string;
	phone: string;
	bio: string;
	location: string;
	gender: string;
	website: string;
	avatar: string;
	id: string;
}
// Define a type for the menu state
export interface MenuState {
	home: boolean;
	profile: boolean;
	create: boolean;
	search: boolean;
	explore: boolean;
	messages: boolean;
	notifications: boolean;
	reels: boolean;
}

export interface SvgProps {
	stroke?: string;
	fill?: string;
	className?: string;
	width?: number;
	height?: number;
}

export interface MenuContextInterface {
	menu: MenuState;
	HandleSetMenu: (key: keyof MenuState, value?: boolean) => void;
}

export interface PostsInterface {
	id: UUID;
	file: string;
	caption: string;
	location: string;
	hash_tag: string[];
	mentions: string[];
	likes: {
		username: string;
		first_name: string;
		last_name: string;
		profile_img: string;
		id_user: UUID;
	}[];
	username: string;
	time_stamp: Date;
}

export interface OtherUserProfile {
	id_user: UUID;
	username: string;
	first_name: string;
	last_name: string;
	bio: string;
	location: string;
	website: string;
	profile_img: URL;
	followers: UUID[];
	following: UUID[];
	post_count: number;
}

export interface Chat {
	content: string;
	createdAt: Date;
	senderId: string;
	id: string;
	conversationId: string;
}

export interface Story {
	user_id: UUID;
	username: string;
	profile_img: string;
	stories: StoryItem[];
	caption: string;
	hash_tag: string;
	mentions: string[];
	location: string;
}

export interface StoryItem {
	story: URL;
	story_id: UUID;
}

export interface Post {
	id: UUID;
	file: string;
	likes: any[];
	caption: string;
	hash_tag: string;
	mentions: string;
	location: string;
}

export interface Conversation {
	lastMessage: {
		content: string;
	};
	participant: {
		username: string;
		avatar: string;
		fullName: string;
		id: string;
	};
	id: string;
}