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

export const OFFER_RECEIVED = gql`
subscription {
	offerReceived {
		offer {
			type
			sdp
		}
		callerInfo{
			username
			avatar
			fullName
			id
		}
	}
}
`;

export const ANSWER_RECEIVED = gql`
	subscription {
		answerReceived {
			type
			sdp
		}
	}
`;

export const ICE_CANDIDATE_RECEIVED = gql`
	subscription {
		iceCandidateReceived {
			candidate
			sdpMid
			sdpMLineIndex
		}
	}
`;
