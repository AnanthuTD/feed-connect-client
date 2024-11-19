"use client";

import React, { useEffect, useRef } from "react";
import Account from "./account";
import { useQuery } from "@apollo/client";
import { GET_POST_LIKES } from "@/graphql/queries";

function AllLiked({
    setLikes,
    postId,
}: {
    setLikes: React.Dispatch<React.SetStateAction<boolean>>;
    postId: string;
}) {
    const elevatedDiv = useRef<HTMLDivElement | null>(null);

    const { data, loading, error } = useQuery(GET_POST_LIKES, {
        variables: { postId },
    });

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching likes</div>;

    const users = data?.getPostLikes.map((like: any) => like.user);

    return (
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
                        Likes
                    </div>
                    <div className="w-1/4"></div>
                </div>
                <div>
                    {users.map((user: any) => (
                        <Account user={user} key={user.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AllLiked;

