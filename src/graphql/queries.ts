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
                likes {
                    id
                }
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