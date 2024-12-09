import { ApolloClient } from "@apollo/client";
import { GET_CONVERSATION } from "@/graphql/queries";

export async function fetchConversation(client: ApolloClient<any>, conversationId: string) {
    try {
        const { data } = await client.query({
            query: GET_CONVERSATION,
            variables: { conversationId },
        });
        return data?.conversation || null;
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return null;
    }
}
