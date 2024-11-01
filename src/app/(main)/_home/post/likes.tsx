import React, { useEffect, useRef, useState } from "react";
import Account from "./account";
import { UUID } from "crypto";

function AllLiked({
	setLikes,
	users,
}: {
	setLikes: React.Dispatch<React.SetStateAction<boolean>>;
	users: {
		username: string;
		first_name: string;
		last_name: string;
		profile_img: string;
		id_user: UUID;
	}[];
}) {
	const elevatedDiv = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function handleClickOutside(this: Document, ev: MouseEvent) {
			if (
				elevatedDiv &&
				!elevatedDiv.current?.contains(ev.target as Node)
			) {
				setLikes(false);
			}
		}

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);
	return (
		<>
			<div
				className="absolute inset-0 flex justify-center items-center bg-blackBlur"
				style={{
					zIndex: 15,
				}}
			>
				<div
					className=" h-2/5 aspect-square bg-elevated rounded-xl overflow-hidden shadow-md transform transition-all duration-500 p-0"
					ref={elevatedDiv}
				>
					{/* header */}
					<div
						className="flex justify-center text-white font-bold p-3 border-b w-full"
						style={{ borderColor: "#3d3d3d", height: "10%" }}
					>
						<div className="w-1/4"></div>
						<div className="w-2/4 justify-center flex items-center">
							Create new post
						</div>
						<div className="w-1/4"></div>
					</div>
					<div>
						{users.map((user) => (
							<Account user={user} key={user.id_user}/>
						))}
					</div>
				</div>
			</div>
		</>
	);
}

export default AllLiked;
