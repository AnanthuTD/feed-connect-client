import { useSubscription } from "@apollo/client";
import { SUBSCRIBE_CONVERSATION } from "@/graphql/subscription";
import { useState } from "react";

function useConversation() {
    const [newConversation, setNewConversation] = useState(null);

    useSubscription(SUBSCRIBE_CONVERSATION, {
        onData: ({ data }) => {
            const newConversation = data.data.ConversationSubscription;
            if (newConversation) {
                setNewConversation(newConversation);
            }
        },
    });

    return { newConversation };
}

export default useConversation;
