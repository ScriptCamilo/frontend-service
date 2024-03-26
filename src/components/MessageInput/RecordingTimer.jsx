import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	timerBox: {
		display: "flex",
		marginLeft: 10,
		marginRight: 10,
		alignItems: "center",
	},
}));

const RecordingTimer = ({ paused }) => {
	const classes = useStyles();
	const initialState = {
		minutes: 0,
		seconds: 0,
	};
	const [timer, setTimer] = useState(initialState);

	useEffect(() => {
		const interval = setInterval(
			() => {
				if (paused) return;
				setTimer(prevState => {
					if (prevState.seconds === 59) {
						return { ...prevState, minutes: prevState.minutes + 1, seconds: 0 };
					}
					return { ...prevState, seconds: prevState.seconds + 1 };
				});
			},
			1000
		);

		return () => {
			clearInterval(interval);
		};
	}, [paused]);

	const addZero = n => {
		return n < 10 ? "0" + n : n;
	};

	return (
		<div className={classes.timerBox}>
			<span>{`${addZero(timer.minutes)}:${addZero(timer.seconds)}`}</span>
		</div>
	);
};

export default RecordingTimer;
