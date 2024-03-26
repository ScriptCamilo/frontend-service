import React, { useState } from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { FileCopyOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  copyIcon: {
    color: "grey[800]",
    width: "16px",
  },
}));

const CopyToClipboard = ({ content, title }) => {
  const classes = useStyles();

  const [tooltipMessage, setTooltipMessage] = useState(`Copiar ${title}`);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setTooltipMessage(`${title} copiado`);
  };

  const handleCloseTooltip = () => {
    setTooltipMessage(`Copiar ${title}`);
  };

  return (
    <Tooltip
      arrow
      onClose={handleCloseTooltip}
      placement="top"
      title={tooltipMessage}
    >
      <IconButton size="small" onClick={handleCopyToClipboard}>
        <FileCopyOutlined fontSize="small" className={classes.copyIcon} />
      </IconButton>
    </Tooltip>
  );
};

export default CopyToClipboard;
