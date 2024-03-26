import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import ModalImage from "../ReactModalImage";

import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  messageMedia: {
    objectFit: "cover",
    width: 30,
    height: 40,
    borderRadius: 4,
    marginRight: 5,
  },
}));

const ImageModal = ({ imageUrl }) => {
  const classes = useStyles();
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    const fetchImage = async () => {
      const { data, headers } = await api.get(imageUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([data], { type: headers["content-type"] })
      );
      setBlobUrl(url);
      setFetching(false);
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <ModalImage
      className={classes.messageMedia}
      smallSrcSet={fetching ? imageUrl : blobUrl}
      medium={fetching ? imageUrl : blobUrl}
      large={fetching ? imageUrl : blobUrl}
      showRotate="true"
      alt="image"
    />
  );
};

export default ImageModal;
