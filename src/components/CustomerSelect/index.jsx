import React, { useEffect, useState } from "react";

import { Chip, FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

import Skeleton from "@material-ui/lab/Skeleton/Skeleton";
import { useAdminContext } from "../../context/AdminContext";
import { i18n } from "../../translate/i18n";
import { useStyles } from "./styles";

/**
 * @typedef {object} NoticeModalParams
 * @property {array<number>} selectedCustomers
 * @property {function} onChange
 *
 * @param {NoticeModalParams} params
 * @returns
 */

function CustomerSelect({ selectedCustomers, onChange }) {
	const classes = useStyles();
	const { customers, customerLoading, hasMore, setPageNumber } = useAdminContext();
	const [isSelectOpen, setIsSelectOpen] = useState(false);

	const handleSelectOption = (e) => {
		onChange(e.target.value);
	};

	useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPageNumber(prevPage => prevPage + 1);
      }
    });

		if (isSelectOpen && hasMore) {
			setTimeout(() => {
				intersectionObserver.observe(document.querySelector("#lastCustomer"));
			}, 500);
		}
    return () => intersectionObserver.disconnect();
  }, [customers, isSelectOpen, hasMore, setPageNumber]);

	return (
		<FormControl margin="dense" variant="outlined" fullWidth>
			<InputLabel>{i18n.t("noticeModal.form.customers")}</InputLabel>
			<Select
				fullWidth
				labelWidth={80}
				multiple
				onOpen={() => setIsSelectOpen(true)}
				onClose={() => setIsSelectOpen(false)}
				value={selectedCustomers}
				onChange={handleSelectOption}
				MenuProps={{
					PaperProps: {
						style: {
							maxHeight: "400px",
						},
					},
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
						{selected.map(customer => {
							return (
								<Chip
									key={customer.id}
									variant="outlined"
									label={customer.name}
									className={classes.chip}
								/>
							)
						})}
					</div>
				)}
			>
				{customers.map((customer, index, arr) => (
					<MenuItem
						id={index === arr.length - 1 && hasMore ? "lastCustomer" : undefined}
						key={customer.id}
						value={customer}
					>
						{customer.name}
					</MenuItem>
				))}
				{customerLoading && (
					<MenuItem disabled>
						<Skeleton width="100%" height={44} />
					</MenuItem>
				)}
			</Select>
		</FormControl>
	)
};

export default CustomerSelect;
