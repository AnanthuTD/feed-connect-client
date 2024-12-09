import { gql } from "@apollo/client";

export const SUBSCRIBE_CONVERSATION = gql`
	subscription ConversationSubscription {
		ConversationSubscription {
			id
			lastMessage {
				content
			}
			participant {
				username
				avatar
				fullName
				id
			}
		}
	}
`;
