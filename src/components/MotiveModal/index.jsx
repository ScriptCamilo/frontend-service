import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import api from '../../services/api';
import { toast } from 'react-toastify';


const useStyles = makeStyles((theme) => ({
  paper: {
    height: 'fit-content',
    width: "100%",
  },
  formControl: {
    width: '100%',
    margin: '15px 0',
  },
}));

export default function MotiveModal({ open, setOpen, handleClose, selectedMotive, setSelectedMotive }) {
  const classes = useStyles();

  const postData = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target).entries())
    data['input-name-label'].length > 0
      &&
      api.post("/motive", { name: data['input-name-label'], })
        .then(() => toast.success('Motivo Criado'))
        .then(() => { handleClose(); setSelectedMotive(null) })
        .catch(() => toast.error('Erro ao criar motivo'))
  }

  const putData = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target).entries())
    data['input-name-label'].length > 0
      ?
      api.put(`/motive/${selectedMotive.id}`, { name: data['input-name-label'], })
        .then(() => toast.success('Motivo Atualizado'))
        .then(() => { handleClose(); setSelectedMotive(null) })
        .catch(() => toast.error('Erro ao atualizar motivo'))
      :
      toast.error('Escreva um motivo')
  }

  return (
    <div>
      <Dialog open={open} handleClose={handleClose} className={classes.paper} maxWidth='sm' fullWidth={true}>
        <DialogTitle id="form-dialog-title">
          {selectedMotive ? 'Editar Motivo' : 'Criar Motivo'}
        </DialogTitle>
        <Formik enableReinitialize={true} >
          <Form onSubmit={selectedMotive ? putData : postData}>
            <DialogContent dividers >
              <Typography variant="subtitle1" gutterBottom>
                Escreva um motivo personalizado
              </Typography>
              <FormControl className={classes.formControl}>
                <TextField
                  id="input-body"
                  name='input-name-label'
                  label="Motivo"
                  variant="outlined"
                  defaultValue={selectedMotive ? selectedMotive.name : ''}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                variant="outlined"
                type='button'
                onClick={() => {
                  handleClose()
                  setSelectedMotive(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                variant="outlined"
                type='submit'
              >
                {selectedMotive ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
    </div>
  );
}