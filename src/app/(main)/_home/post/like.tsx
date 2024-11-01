"use client";
import React, { useState } from "react";
import Heart from "./heart";

function Likes() {
	const [like, setLike] = useState(false);
	return (
		<>
			<div onClick={() => setLike(!like)}>
				<Heart className="cursor-pointer" like={like} />
			</div>
		</>
	);
}

export default Likes;
