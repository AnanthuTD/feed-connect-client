import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { message as antdMessage } from "antd";
import {
	FETCH_MESSAGES,
	SEND_MESSAGE,
	SUBSCRIBE_MESSAGE,
} from "@/graphql/queries";
import { Chat } from "@/utils/Interfaces";

export const useChatLogic = (
	recipient: string,
	chatLogRef: React.RefObject<HTMLDivElement>
) => {
	const [message, setMessage] = useState("");
	const [skip, setSkip] = useState(0);
	const [take] = useState(20);
	const [hasMore, setHasMore] = useState(true);
	const [chats, setChats] = useState<Chat[]>([]);

	const { data, loading, fetchMore } = useQuery(FETCH_MESSAGES, {
		variables: { receiverId: recipient, take, skip },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (data?.getMessages) {
			const { messages, hasMore } = data.getMessages;
			setChats((prev) => [...messages, ...prev]);
			setHasMore(hasMore);
		}
	}, [data]);

	useSubscription(SUBSCRIBE_MESSAGE, {
		onData: ({ data }) => {
			const newMessage = data.data.MessageSubscription;
			if (newMessage) setChats((prev) => [...prev, newMessage]);
		},
	});

	const [sendMessage] = useMutation(SEND_MESSAGE, {
		onCompleted: () => setMessage(""),
		onError: () => antdMessage.error("Failed to send message!"),
	});

	const handleFetchMore = () => {
		setSkip((prevSkip) => prevSkip + take);
		fetchMore({ variables: { skip: skip + take } });
	};

	const handleSendMessage = () => {
		if (message) {
			sendMessage({ variables: { receiverId: recipient, content: message } });
		}
	};

	useEffect(() => {
		if (chatLogRef.current && chats.length === take) {
			chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
		}
	}, [chats, chatLogRef]);

	return {
		chats,
		loading,
		hasMore,
		handleFetchMore,
		handleSendMessage,
		setMessage,
		message,
	};
};
