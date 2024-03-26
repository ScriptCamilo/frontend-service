import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { Form, Formik } from "formik";
import api from "../../services/api";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
  },
  formControl: {
    width: "100%",
    margin: "15px 0",
  },
  items: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: "0",
  },
  select: {
    "& button": {
      display: "none",
    },
  },
}));

export default function EndTicketModal({
  open,
  handleClose,
  ticketId,
  contactId,
  whatsappId,
  closeTicket,
  queue,
}) {
  const classes = useStyles();
  const history = useHistory();
  const [personName, setPersonName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setPersonName(event.target.value);
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = Object.fromEntries(new FormData(event.target).entries());
    if (formData["input-motivo"].length > 0) {
      try {
        await api.post("/end-tickets", {
          option: formData["input-motivo"],
          body: formData["input-body"],
          ticketId,
          contactId,
          whatsappId,
        });
        toast.success("Ticket Finalizado");
        closeTicket();
        handleClose();
        history.push("/tickets");
        setLoading(false);
      } catch (error) {
        toast.error("Erro ao enviar feedback");
        setLoading(false);
      }
    } else {
      toast.error("Escolha um motivo para finalizar");
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        className={classes.paper}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle id="form-dialog-title">Finalizar Atendimento</DialogTitle>
        <Formik>
          <Form onSubmit={submitFeedback}>
            <DialogContent dividers>
              <Typography variant="subtitle1" gutterBottom>
                Observação
              </Typography>
              <FormControl className={classes.formControl}>
                <InputLabel id="input-name-label">Motivo</InputLabel>
                <Select
                  labelId="input-name-label"
                  id="input-motivo"
                  name="input-motivo"
                  value={personName}
                  onChange={handleChange}
                  input={<Input />}
                  className={classes.select}
                >
                  {queue?.motives.map((motive) => (
                    <MenuItem
                      key={motive.id}
                      value={motive.name}
                      className={classes.items}
                    >
                      <p style={{ margin: "0px" }}>{motive.name}</p>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <TextField
                  id="input-body"
                  name="input-body"
                  label="Texto"
                  variant="outlined"
                  multiline
                  minRows={2}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                variant="contained"
                type="button"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                disabled={loading}
                color="primary"
                variant="contained"
                type="submit"
              >
                Finalizar
              </Button>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
    </div>
  );
}
