import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import { TextField, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { Box, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  input: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#adb5bd",
      },
      "&:hover fieldset": {
        borderColor: "#adb5bd",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#adb5bd",
      },
    },
    "& .MuiInputBase-input": {
      color: "black",
    },
    "& .MuiFormLabel-root": {
      color: "black",
    },
  },
  formStyle: {
    position: "sticky",
    top: 0,
    background: "inherit",
    zIndex: 1,
  },
}));

const SearchBar = ({
  handleSearch,
  searchQuery,
  setSearchQuery,
  headerName,
  searchName
}) => {
  const classes = useStyles();

  return (
    <div className={classes.formStyle}>
      {headerName && (
        <Box sx={{ p: 1, textAlign: "left" }}>
          <Typography variant="h5" component="h6">
            {headerName}
          </Typography>
        </Box>
      )}
      <form onSubmit={(e) => handleSearch(e)}>
        <TextField
          label={searchName}
          value={searchQuery}
          style={{ width: "100%" }}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={classes.input}
          InputProps={{
            endAdornment: (
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </form>
    </div>
  );
};

export default SearchBar;
