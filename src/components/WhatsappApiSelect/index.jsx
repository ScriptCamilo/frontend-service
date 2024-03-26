import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const WhatsappApiSelect = ({ selectedWhatsappIds, onChange }) => {
	const classes = useStyles();
	const [whatsappApis, setWhatsappApis] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/whatsapp-api");
				setWhatsappApis(data);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>Whatsapp APIS Em Uso</InputLabel>
				<Select
					multiple
					labelWidth={60}
					value={selectedWhatsappIds || []}
					onChange={handleChange}
					MenuProps={{
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						},
						transformOrigin: {
							vertical: "top",
							horizontal: "left",
						},
						getContentAnchorEl: null,
					}}
					renderValue={selected => (
						<div className={classes.chips}>
							{selected?.length > 0 &&
								selected.map(id => {
									const whatsapp = whatsappApis.find(q => q.id === id);
									return whatsapp ? (
										<Chip
											key={id}
											style={{ backgroundColor: 'black', color: 'white' }}
											variant="outlined"
											label={whatsapp.name}
											className={classes.chip}
										/>
									) : null;
								})}
						</div>
					)}
				>
					{whatsappApis.map(whatsapp => (
						<MenuItem key={whatsapp.id} value={whatsapp.id}>
							{whatsapp.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default WhatsappApiSelect;