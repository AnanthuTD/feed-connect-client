import { gql } from "@apollo/client";

export const ADD_COMMENT = gql`
	mutation AddComment($postId: String!, $content: String!) {
		addComment(postId: $postId, content: $content) {
			id
			content
			createdAt
			author {
				id
				username
			}
		}
	}
`;

export const EDIT_COMMENT = gql`
	mutation EditComment($commentId: String!, $content: String!) {
		editComment(commentId: $commentId, content: $content) {
			id
			content
		}
	}
`;

export const DELETE_COMMENT = gql`
	mutation DeleteComment($commentId: String!) {
		deleteComment(commentId: $commentId)
	}
`;

export const SEND_OFFER = gql`
	mutation SendOffer($offer: OfferInput!) {
		sendOffer(offer: $offer)
	}
`;

export const SEND_ANSWER = gql`
	mutation SendAnswer($answer: AnswerInput!) {
		sendAnswer(answer: $answer)
	}
`;

export const SEND_ICE_CANDIDATE = gql`
	mutation SendIceCandidate($candidate: IceCandidateInput!) {
		sendIceCandidate(candidate: $candidate)
	}
`;

export const END_CALL = gql`
	mutation EndCall($targetUserId: ID!) {
		endCall(targetUserId: $targetUserId)
	}
`;
