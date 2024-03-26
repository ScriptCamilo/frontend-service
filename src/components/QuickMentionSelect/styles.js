import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
	"@keyframes myEffect": {
		"0%": {
			transform: 'translateY(100%)'
		},
		"100%": {
			transform: "translateY(0)"
		}
	},
  messageQuickAnswersWrapper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    // maxHeight: "560px",
    margin: 0,
    position: "absolute",
    background: "#ffffff",
    padding: "2px",
    border: "1px solid #CCC",
    left: 0,
		bottom: "0",
		marginBottom: "66px",
		maxHeight: "200px",
    width: "83%",
    zIndex: 9999,
		marginLeft: "5%",
		animation: '$myEffect 0.1s ease',
    "& li": {
      display: "flex",
      alignItems: "center",
      listStyle: "none",
      cursor: "pointer",
      "&:hover": {
        background: "#F1F1F1",
      },
      "& span": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "32px",
        width: "100%",
      },
    },
    '& li:last-child[data-loading="true"]': {
      justifyContent: "center",
      padding: "8px",
      cursor: "unset",
      "&:hover": {
        background: "unset",
      },
    },
  },
}))
