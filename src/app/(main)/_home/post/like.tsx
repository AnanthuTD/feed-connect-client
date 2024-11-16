"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { TOGGLE_LIKE } from "@/graphql/queries";
import Heart from "./heart";

function Likes({ postId, initialLike }: { postId: string; initialLike: boolean }) {
    const [like, setLike] = useState(initialLike);
    const [toggleLike, { loading }] = useMutation(TOGGLE_LIKE, {
        variables: { postId },
        onCompleted: (data) => {
            setLike(data.toggleLike); // Update the like state based on mutation response
        },
        onError: (error) => {
            console.error("Error toggling like:", error);
        },
    });

    const handleToggleLike = () => {
        if (!loading) {
            toggleLike(); // Trigger the GraphQL mutation
        }
    };

    return (
        <div onClick={handleToggleLike}>
            <Heart className="cursor-pointer" like={like} />
        </div>
    );
}

export default Likes;

