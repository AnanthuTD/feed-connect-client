import Image from "next/image";
import SwitchButton from "./brightBlueButton";
import React from "react";

function AccountSM({username}:{username:string}) {
    return (
        <>
            <div className="flex my-3 cursor-pointer">
                <Image
                    src="/images/pro-pic.jpg"
                    width={40}
                    height={40}
                    alt=""
                    className="rounded-full"
                />
                <p className="flex items-center mx-4 text-sm">{username}</p>
                <SwitchButton text="Follow" />
            </div>
        </>
    );
}

export default AccountSM;
