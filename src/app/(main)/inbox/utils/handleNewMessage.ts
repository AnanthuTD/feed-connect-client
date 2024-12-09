import { fetchConversation } from "../utils/conversationService";
import { Chat, Conversation } from "@/utils/Interfaces";
import { ApolloClient } from "@apollo/client";

async function handleNewMessage(
    conversations: Conversation[],
    newMessage: Chat,
    updateConversations: (updated: Conversation[]) => void,
    client: ApolloClient<any>
) {
    const { conversationId, content } = newMessage;

    // Clone conversations to avoid mutating the original state
    const updatedConversations = [...conversations];

    // Find the index of the existing conversation
    const index = updatedConversations.findIndex((conv) => conv.id === conversationId);

    if (index !== -1) {
        // Update existing conversation
        updatedConversations[index] = {
            ...updatedConversations[index],
            lastMessage: {
                content: content,
            },
        };

        // Move it to the top
        const [updatedConversation] = updatedConversations.splice(index, 1);
        updatedConversations.unshift(updatedConversation);
    } else {
        // Fetch the new conversation details
        const newConvo = await fetchConversation(client, conversationId);

        if (newConvo) {
            // Add new conversation to the top
            updatedConversations.unshift(newConvo);
        }
    }

    // Update the state
    updateConversations(updatedConversations);
}
