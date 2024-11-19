import React from "react";
import { Input, Button } from "antd";

interface MessageInputProps {
  message: string;
  setMessage: (value: string) => void;
  handleSendMessage: () => void;
  icon: React.ReactNode;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
  icon,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="m-3 flex items-center justify-between gap-3 rounded-full p-3 outline outline-1 outline-border_grey">
      <div className="flex w-full items-center gap-3">
        {icon}
        <Input.TextArea
          className="w-full resize-none bg-transparent text-sm text-primaryText outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
          style={{ overflowY: "hidden" }}
        />
      </div>
      {message && (
        <Button type="link" onClick={handleSendMessage} className="text-sm font-bold text-blue-500">
          Send
        </Button>
      )}
    </div>
  );
};
