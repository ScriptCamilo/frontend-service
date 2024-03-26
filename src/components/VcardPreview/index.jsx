import React, { useEffect, useState } from 'react';

import { Button, Divider } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import toastError from '../../errors/toastError';
import api from '../../services/api';
import NewTicketModal from '../NewTicketModal';

const VcardPreview = ({ name, number }) => {
  const [open, setOpen] = useState(false);
  const [selectedContact, setContact] = useState({
    name: '',
    number: 0,
    profilePicUrl: '',
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          let contactObj = {
            name,
            number,
            email: '',
          };
          const { data } = await api.post('/contact', contactObj);
          setContact(data);
        } catch (err) {
          console.log(err);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [name, number]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <NewTicketModal modalOpen={open} onClose={handleClose} initialContact={selectedContact} />
      <div style={{minWidth: '250px'}}>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Avatar src={selectedContact.profilePicUrl} />
            {/* <Avatar src={''} /> */}
          </Grid>
          <Grid item xs={9}>
            <Typography
              style={{ marginTop: '12px', marginLeft: '10px' }}
              variant="subtitle1"
              color="primary"
              gutterBottom
            >
              {isNaN(selectedContact.name) ? selectedContact.name : name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
            <Button fullWidth color="primary" onClick={handleOpen} disabled={!selectedContact.number}>
              Conversar
            </Button>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default VcardPreview;
