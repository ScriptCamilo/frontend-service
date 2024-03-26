import React, { useState } from 'react';
import {
  Button,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import getWildCardsFromTicket from '../MessageInput/wildCardReplacerHelpers/wildCardsGetter';
import { useEffect } from 'react';

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  paper: {
    marginRight: theme.spacing(2),
  }
}));

export default function CustomWildCardsDisplay({ ticketId }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [wildCardsList, setWildCardsList] = useState([]);
  const defaultLabels = ['Protocolo', 'Atendente', 'Setor', 'Cliente'];
  
  useEffect(() => {
    const getWildCardsList = async () => {
      const wildCardsObj = await getWildCardsFromTicket(ticketId);

      const list = Object.keys(wildCardsObj).map((prop) => `{${prop}}`);
      setWildCardsList(list);
    }

    getWildCardsList();
  }, [])

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <div className={ classes.root }>
      <div>
        <IconButton>
          <AddCircleOutlineIcon
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          />
        </IconButton>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center bottom' : 'center top' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem onClick={handleClose}>
                      <strong>Variáveis Disponíveis:</strong>
                    </MenuItem>
                    { wildCardsList.length > 0 && wildCardsList.map((wildCard, i) => (
                        <MenuItem onClick={handleClose} key={ wildCard } >
                          { i < defaultLabels.length ? `${defaultLabels[i]}: ${wildCard}` : `${wildCard}` }
                        </MenuItem>
                      ))
                    }
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  );
}
