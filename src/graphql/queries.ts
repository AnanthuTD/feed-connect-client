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
