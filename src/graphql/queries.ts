import { gql } from '@apollo/client'

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
`

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
                    name
                }
            }
            totalCount
            hasMore
        }
    }
`

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