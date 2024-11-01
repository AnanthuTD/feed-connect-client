import React from "react";
import Accounts from "./accounts";
import SuggestedAccounts from "./suggestedAccounts";

function AccountSuggestion() {
    return (
        <div className="w-[300px]">
            <Accounts />
            <div className="my-3"></div>
            <SuggestedAccounts />
        </div>
    );
}

export default AccountSuggestion;
