import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import ModalImage from "../ReactModalImage";

const useStyles = makeStyles((theme) => ({
  messageMedia: {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
}));

const ModalImageCors = ({ imageUrl, proxy }) => {
  const classes = useStyles();

  return (
    <ModalImage
      className={classes.messageMedia}
      smallSrcSet={imageUrl}
      medium={imageUrl}
      large={imageUrl}
      alt="image"
			proxy={proxy}
    />
  );
};

export default ModalImageCors;
