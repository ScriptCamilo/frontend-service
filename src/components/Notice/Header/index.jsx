import React from "react";

import {
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
} from '@material-ui/core';
import { Alert } from "@material-ui/lab";
import { Business, Close } from '@material-ui/icons';

import { useAuthContext } from '../../../context/Auth/AuthContext';
import { useStyles } from './styles';

/**
 * @typedef {object} NoticeInfos
 * @property {string} message
 * @property {string} url
 * @property {string} severity
 *
 * @typedef {object} PopupParams
 * @property {NoticeInfos} notice
 * @property {function} handleClose
 *
 * @param {PopupParams} params
 * @returns
 */

function Header({ notice, handleClose }) {
  const classes = useStyles();
  const { isAdminClient } = useAuthContext();

  const handleClick = () => {
    if (notice.url) {
      return window.open(notice.url);
    }
    handleClose();
  }

  return (
    <>
      <Alert severity={notice?.severity || "info"} className={classes.alert} variant="filled">
        {notice?.message}

        <Button
          onClick={handleClick}
          className={classes.button}
          variant="contained"
        >
          {notice?.url ? "Link" : "Fechar"}
        </Button>

        {notice?.url && (
          <IconButton style={{ marginLeft: "auto" }} onClick={handleClose}>
            <Close />
          </IconButton>
        )}
      </Alert>

      {isAdminClient && (
        <List className={classes.customerList}>
          {notice.customers.map(customer => (
            <ListItem key={customer.id}>
              <ListItemAvatar>
                <Avatar className={classes.customerAvatar}>
                  <Business color="primary" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={customer.name}
                secondary={customer.url}
                className={classes.customerText}
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}

export default Header;
