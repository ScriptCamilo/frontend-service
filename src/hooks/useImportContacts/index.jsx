import { useEffect, useState } from "react";
import connectToSocket from "../../services/socket-io";
import { useAuthContext } from "../../context/Auth/AuthContext";


const useImportContacts = ({ user }) => {
	const [progress, setProgress] = useState(null);
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		let socket;
		if (user.id) {
			socket = connectToSocket({
				userId: user.id,
				scope: "useImportContacts",
				component: "useImportContacts",
			});
		
			socket.on("sendPercentageProgress", ({ 
					percentage, 
					validNumbersArray, 
					invalidNumbersArray 
				}) => {
				setProgress(percentage);
				if (validNumbersArray && invalidNumbersArray) {
					setProgress(null);
					setShowResults({validNumbersArray, invalidNumbersArray});
				}
			});
		}

		return () => {
			if (socket) {
				socket.disconnect();
			}
		};
	}, [user.id])

	return { progress, showResults, setShowResults };
};

export default useImportContacts;
