import React, { useEffect, useState } from "react";

import {
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DescriptionIcon from "@material-ui/icons/Description";

import api from "../../services/api";
import "./styles.css";
import { getAWSUrl } from "../../config";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  listItem: {
    width: "100%",
  },
}));

const CustomFileViewer = ({ imageUrl, name, previousMedia }) => {
  const classes = useStyles();
  const [blobUrl, setBlobUrl] = useState(undefined);

  useEffect(() => {
    if (!imageUrl) return;
    if (imageUrl.includes("blob:")) {
      setBlobUrl(imageUrl);
      return;
    }
    const fetchImage = async () => {
      try {
        if (imageUrl.name) {
          return;
        }
        const { data, headers } = await api.get(imageUrl, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers["content-type"] })
        );
        setBlobUrl(url);
      } catch (e) {
        setBlobUrl(
          `${getAWSUrl()}${
            imageUrl.includes("public/")
              ? imageUrl.split("public/")[1]
              : imageUrl
          }`
        );
      }
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          {previousMedia ? "Arquivo Atual" : "Novo Arquivo "}
        </ListSubheader>
      }
      className={classes.root}
    >
      <Link href={blobUrl} target="_blank">
        <ListItem
          button
          className={classes.listItem}
          style={{ backgroundColor: previousMedia ? "aqua" : "yellow" }}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              name ? name : imageUrl.split("/")[imageUrl.split("/").length - 1]
            }
          />
        </ListItem>
      </Link>
    </List>
  );
};

export default CustomFileViewer;
