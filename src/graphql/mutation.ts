import { gql } from '@apollo/client';

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


