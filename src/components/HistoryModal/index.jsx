import React, { useState, useContext } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import { toast } from "react-toastify";
import api from "../../services/api";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
}));

const HistoryModal = ({ modalOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState();
  const classes = useStyles();
  const { whatsApps, loading: loadingWhatsapps } = useContext(WhatsAppsContext);

  const { user: loggedInUser } = useContext(AuthContext);

  const handleClose = () => {
    onClose();
  };

  const handleLoadHistoric = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dark("Carregando Históricos de Contatos, por favor aguarde", {
      position: "top-right",
      hideProgressBar: false,
      pauseOnHover: false,
      closeOnClick: true,
      draggable: true,
      autoClose: false,
    });
    api
      .post("/history/", { whatsappId: selectedWhatsapp, limit: 100 })
      .then(() => {
        setLoading(false);
        handleClose();
        toast.success("Histórico carregado com sucesso!", {
          position: "top-right",
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          draggable: true,
          autoClose: false,
        });
      });
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleLoadHistoric}>
        <DialogTitle id="form-dialog-title">Carregar Histórico</DialogTitle>
        <DialogContent dividers>
          <Can
            role={loggedInUser.profile}
            perform="ticket-options:transferWhatsapp"
            yes={() =>
              !loadingWhatsapps && (
                <FormControl variant="outlined" className={classes.maxWidth}>
                  <InputLabel>Para Conexão</InputLabel>
                  <Select
                    required
                    value={selectedWhatsapp}
                    onChange={(e) => setSelectedWhatsapp(e.target.value)}
                    label={i18n.t(
                      "transferTicketModal.fieldConnectionPlaceholder"
                    )}
                  >
                    {whatsApps.map((whasapp) => (
                      <MenuItem key={whasapp.id} value={whasapp.id}>
                        {whasapp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {i18n.t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
          >
            Carregar
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HistoryModal;
