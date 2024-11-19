import { Chat } from "@/utils/Interfaces";

/**
 * Determines if a new date header should be displayed between messages.
 * @param currentTimestamp Current message's timestamp.
 * @param nextTimestamp Next message's timestamp.
 * @returns Boolean indicating if a new date header should be displayed.
 */
export const shouldDisplayDate = (
	currentTimestamp: Date,
	nextTimestamp: Date
): boolean => {
	return currentTimestamp.getDate() !== nextTimestamp.getDate();
};

/**
 * Formats a timestamp into a readable string.
 * @param timestamp The timestamp to format.
 * @returns A formatted string for display.
 */
export const formatTimestamp = (timestamp: Date | string): string => {
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "numeric",
	};

	return new Date(timestamp).toLocaleString("en-IN", options);
};

/**
 * Determines if the time of a message should be displayed.
 * @param currentTimestamp Current message's timestamp.
 * @param nextTimestamp Next message's timestamp.
 * @param index Index of the current message.
 * @param totalMessages Total number of messages in the chat.
 * @returns Boolean indicating if the time should be displayed.
 */
export const shouldDisplayTime = (
	currentTimestamp: Date,
	nextTimestamp: Date,
	index: number,
	totalMessages: number
): boolean => {
	const currentTimestampString = formatTimestamp(currentTimestamp);
	const nextTimestampString = formatTimestamp(nextTimestamp);

	return (
		currentTimestampString !== nextTimestampString ||
		index === totalMessages - 1
	);
};

/**
 * Determines if the message bubble should have rounded corners on the top or bottom.
 * @param prevChat Previous chat message.
 * @param currentChat Current chat message.
 * @param nextChat Next chat message.
 * @returns A tuple [boolean, boolean] where the first value indicates top rounding,
 * and the second indicates bottom rounding.
 */
export const shouldRoundTopNone = (
	prevChat: Chat | null,
	currentChat: Chat,
	nextChat: Chat | null
): [boolean, boolean] => {
	const prevTimestampString = formatTimestamp(prevChat?.createdAt || "");
	const nextTimestampString = formatTimestamp(nextChat?.createdAt || "");
	const currentTimestampString = formatTimestamp(currentChat?.createdAt);

	const prevMessageSenderUsername = prevChat?.senderId || undefined;
	const currentMessageSenderUsername = currentChat.senderId;
	const nextMessageSenderUsername = nextChat?.senderId || undefined;

	const topRounded =
		prevMessageSenderUsername === currentMessageSenderUsername &&
		prevTimestampString === currentTimestampString;

	const bottomRounded =
		nextMessageSenderUsername === currentMessageSenderUsername &&
		nextTimestampString === currentTimestampString;

	return [topRounded, bottomRounded];
};
