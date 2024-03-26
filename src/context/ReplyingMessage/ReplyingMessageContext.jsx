import React, { createContext, useContext, useState } from "react";

export const ReplyMessageContext = createContext();

export function useReplyMessageContext() {
	return useContext(ReplyMessageContext)
}

export function ReplyMessageProvider ({ children }) {
	const [replyingMessage, setReplyingMessage] = useState(null);

	return (
		<ReplyMessageContext.Provider
			value={{ replyingMessage, setReplyingMessage }}
		>
			{children}
		</ReplyMessageContext.Provider>
	);
};
