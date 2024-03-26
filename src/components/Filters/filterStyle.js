import { makeStyles } from "@material-ui/core/styles";

export const useStylesFilter = makeStyles((theme) => ({
  container: {
    display: "flex",
    gap: "16px",
    paddingBottom: "8px",
    width: "100%",
  },

  filterContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "8px 0 0 8px",
    width: "100%",
  },

  filtersTitle: {
    width: "100%",
    fontWeight: "bold",
    opacity: "0.8",
  },

  textInput: {
    width: "100%",
    "& .MuiInputBase-input": {
      fontSize: "0.8em",
    },
    "& .MuiInputLabel-outlined": {
      fontSize: "0.8em",
    },
    "& .MuiOutlinedInput-root": {
      height: "34px",
      width: "100%",
    },
    "& .MuiFormControl-root": {
      "& .MuiInputBase-root": {
        width: "100%",
      },
    },
  },

  divider: {
    backgroundColor: theme.palette.primary.main,
    height: "unset",
    width: "8px",
  },

  filterSecondPart: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  },

  filterDate: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },

  filterButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    width: "100%",
  },

  searchBtn: {
    padding: "8px 24px",
    width: "100%",
  },

  clearFiltersBtn: {
    padding: "8px 24px",
    width: "100%",
  },

  gridItem: {
    width: "100%",
    padding: "8px",
  },
}));
