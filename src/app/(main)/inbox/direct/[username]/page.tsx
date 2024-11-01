import React from "react";
import ChatBox from "../../_components/chatBox";

export default async function Page(props: { params: Promise<{ username: string }> }) {
    const params = await props.params;
    const { username } = params;
    return (
		<>
			<ChatBox recipient={username}/>
		</>
	);
}
