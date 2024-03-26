import React from "react";

import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { useStyles } from './styles';

/**
 * @typedef {object} NoticeInfos
 * @property {string} title
 * @property {string} message
 * @property {string} url
 *
 * @typedef {object} PopupParams
 * @property {NoticeInfos} notice
 * @property {function} handleClose
 *
 * @param {PopupParams} params
 * @returns
 */

const youtubeEmbedPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]{11}$/

function Popup({ notice, handleClose }) {
  const classes = useStyles();
  const isYoutubeVideo = youtubeEmbedPattern.test(notice.url);

  const handleClick = () => {
    if (notice.url && !isYoutubeVideo) {
      return window.open(notice.url);
    }
    handleClose();
  }

  return (
    <Box className={classes.box}>
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.typography}>
          {notice?.title || "Aviso do time DeskRio"}
        </Typography>
        {(notice?.url && !isYoutubeVideo) && (
          <IconButton onClick={handleClose} className={classes.closeIcon}>
            <Close />
          </IconButton>
        )}
        <Typography variant="body1">
          {notice?.message}
        </Typography>
        {isYoutubeVideo && (
          <iframe
            className={classes.youtubeVideo}
            src={`${notice.url}?rel=0`}
            title="YouTube video player"
            frameborder="0"
            allowFullScreen
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        )}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleClick}
        >
          {(notice?.url && !isYoutubeVideo) ? "Link" : "Fechar"}
        </Button>
      </Paper>
    </Box>
  );
}

export default Popup;
