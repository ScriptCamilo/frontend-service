import React, { useEffect, useMemo, useState } from "react";

import { CircularProgress, Grid, TextField } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete/Autocomplete';

import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const filter = createFilterOptions({
	trim: true,
	stringify: option => `${option.name} - ${option.number}`,
});

const ContactSelect = ({ selectedContacts, onChange }) => {
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");

	const selectedContactIds = useMemo(
		() => selectedContacts.map(contact => contact.id),
		[selectedContacts.length],
	);

	const handleSelectOption = (_e, values) => {
		const isValueRemoved = selectedContacts.length > values.length;
		const newValue = !isValueRemoved && values.pop();
		if (newValue?.id) {
			values.push(newValue);
			onChange(values);
		} else if (isValueRemoved) {
			onChange(values);
		}

		setOptions([]);
	};

	const createAddContactOption = (filterOptions, params) => {
		let filtered = filter(filterOptions, params);

		filtered = filtered.filter(option => {
			return option.channel === "whatsapp" && !selectedContactIds.includes(option.id);
		});

		return filtered;
	};

	const renderOption = option => {
		return `${option.name} - ${option.number}`;
	};

	const renderOptionLabel = option => {
		return `${option.name}`;
	};

	const fetchContacts = async () => {
		try {
			const { data } = await api.get("/contacts", {
				params: { searchParam },
			});
			setOptions(data.contacts);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	useEffect(() => {
		if (searchParam?.length < 3) {
			setLoading(false);
			setOptions([]);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			fetchContacts();
		}, 300);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam]);

	return (
		<Grid xs={12} item>
			<Autocomplete
				fullWidth
				options={options}
				loading={loading}
				clearOnBlur
				onBlur={() => setOptions([])}
				autoHighlight
				freeSolo
				multiple
				value={selectedContacts}
				getOptionLabel={renderOptionLabel}
				renderOption={renderOption}
				filterOptions={createAddContactOption}
				onChange={(e, newValue) => handleSelectOption(e, newValue)}
				renderInput={params => (
					<TextField
						{...params}
						label={i18n.t("newTicketModal.fieldLabel")}
						variant="outlined"
						autoFocus
						onChange={e => setSearchParam(e.target.value)}
						InputProps={{
							...params.InputProps,
							endAdornment: (
								<React.Fragment>
									{loading ? (
										<CircularProgress color="inherit" size={20} />
									) : null}
									{params.InputProps.endAdornment}
								</React.Fragment>
							),
						}}
					/>
				)}
			/>
		</Grid>
	)
};

export default ContactSelect;
