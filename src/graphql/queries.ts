import { gql } from "@apollo/client";

export const GET_PROFILE = gql`
	query GetProfile {
		user {
			fullName
			username
			avatar
			id
		}
	}
`;

export const GET_POSTS = gql`
	query GetPosts($take: Int!, $skip: Int!) {
		getPosts(take: $take, skip: $skip) {
			posts {
				id
				caption
				location
				file
				createdAt
				likedByCurrentUser
				likeCount
				author {
					id
					username
					fullName
				}
			}
			totalCount
			hasMore
		}
	}
`;

export const GET_STORIES = gql`
	query GetStories($take: Int!, $skip: Int!) {
		getStories(take: $take, skip: $skip) {
			stories {
				id
				caption
				fileUrl
				location
				hashTag
				mentions
				author {
					id
					username
					fullName
				}
			}
			totalCount
			hasMore
		}
	}
`;

export const FETCH_MESSAGES = gql`
	query Messages($receiverId: String!, $take: Int, $skip: Int) {
		getMessages(receiverId: $receiverId, take: $take, skip: $skip) {
			messages {
				id
				content
				senderId
				conversationId
				createdAt
			}
			hasMore
		}
	}
`;

export const SEND_MESSAGE = gql`
	mutation SendMessage($receiverId: String!, $content: String!) {
		sendMessage(receiverId: $receiverId, content: $content) {
			id
			content
			senderId
			conversationId
			createdAt
		}
	}
`;

export const SUBSCRIBE_MESSAGE = gql`
	subscription MessageSubscription {
		MessageSubscription {
			id
			content
			senderId
			conversationId
			createdAt
		}
	}
`;

export const GET_PROFILE_BY_ID = gql`
	query GetProfile($id_user: ID!) {
		getProfile(id_user: $id_user) {
			username
			profile_img
		}
	}
`;

export const GET_CONVERSATIONS = gql`
	query GetConversations {
		conversations {
			lastMessage {
				content
			}
			participants {
				username
				avatar
				fullName
				id
			}
		}
	}
`;

export const TOGGLE_LIKE = gql`
	mutation ToggleLike($postId: String!) {
		toggleLike(postId: $postId)
	}
`;

export const GET_POST_LIKES = gql`
	query GetPostLikes($postId: String!) {
		getPostLikes(postId: $postId) {
			id
			user {
				id
				username
				first_name
				last_name
				profile_img
			}
		}
	}
`;


export const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    userProfile(username: $username) {
      user {
        id
        username
        fullName
        avatar
        email
        createdAt
      }
      followers {
        id
        username
        fullName
        avatar
      }
      following {
        id
        username
        fullName
        avatar
      }
      posts {
        id
        file
        caption
        createdAt
      }
    }
  }
`;