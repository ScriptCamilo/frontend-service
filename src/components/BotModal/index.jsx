import React, { useState } from "react";

import { TextField } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";

import { useWhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import DefaultWildCardsDisplay from "../DefaultWildCardsDisplay";
import { useStyles } from './styles';

const BotModal = ({ modalOpen, onClose, getChatBots }) => {
  const classes = useStyles();
  const {
    whatsApps,
    allMetas: metas,
    whatsAppApis,
  } = useWhatsAppsContext();

  const [loading, setLoading] = useState(false);
  const [autoFinish, setAutoFinish] = useState(false);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState();
  const [selectedWhatsappApi, setSelectedWhatsappApi] = useState();
  const [selectedMeta, setSelectedMeta] = useState();

  const handleAutoFinishSwitch = () => {
    setAutoFinish((prevState) => {
      return !prevState;
    });
  };

  const handleClose = () => {
    onClose();
    setAutoFinish(false);
  };

  const createChatBot = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      const isSecondsValid = autoFinish && +formProps.autoFinishSeconds > 0;

      if (autoFinish && !isSecondsValid) {
        toast.error('O campo de segundos para a finalização automática é obrigatório');
        return;
      }

      formProps.autoFinishSeconds = isSecondsValid ? +formProps.autoFinishSeconds : null;

      if (formProps.whatsappId === "") {
        formProps.whatsappId = null;
      }

      if (formProps.metaId === "") {
        formProps.metaId = null;
      }

      if (formProps.whatsappApiId === "") {
        formProps.whatsappApiId = null;
      }

      await api.post("/chatbot", formProps);
      getChatBots();
      setTimeout(() => {}, 500);
      toast.success("ChatBot criado com sucesso");
      handleClose();
    } catch {
      toast.error("Já existe um ChatBot para essa conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">Criar ChatBot</DialogTitle>

      <DefaultWildCardsDisplay />

      <Formik>
        <Form onSubmit={createChatBot}>
          <DialogContent>
            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                labelId="input-name-label"
                id="name"
                name="name"
                label="Nome do Chatbot"
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="welcomeMessage"
                name="welcomeMessage"
                label="Mensagem de Boas-vindas"
                multiline
                minRows={3}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="endMessage"
                name="endMessage"
                label="Mensagem de Finalização de Atendimento"
                multiline
                minRows={3}
              />
            </FormControl>
            <h2>Pesquisa de Satisfação</h2>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="headerMessage"
                name="headerMessage"
                label="Cabeçalho"
                multiline
                minRows={2}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="avaliationBody"
                name="avaliationBody"
                label="Escala de Avaliação"
                multiline
                minRows={3}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="footerMessage"
                name="footerMessage"
                label="Rodapé"
                multiline
                minRows={2}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="avaliationReply"
                name="avaliationReply"
                label="Mensagem de tentativa inválida"
                multiline
                minRows={2}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="avaliationEnd"
                name="avaliationEnd"
                label="Mensagem de despedida de avaliação"
                multiline
                minRows={2}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                type="number"
                id="avaliationTime"
                name="avaliationTime"
                label="Tempo de avaliação (Minutos)"
                variant="outlined"
                defaultValue={0}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel id="conexao-label">Conexão</InputLabel>
              <Select
                id="whatsappId"
                name="whatsappId"
                value={selectedWhatsapp}
                onChange={(e) => setSelectedWhatsapp(e.target.value)}
                labelId="conexao-label"
              >
                <MenuItem value={""}>Sem conexão</MenuItem>
                {whatsApps.map((whasapp) => (
                  <MenuItem key={whasapp.id} value={whasapp.id}>
                    {whasapp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel id="conexao-label">Conexão Apis</InputLabel>
              <Select
                id="whatsappApiId"
                name="whatsappApiId"
                value={selectedWhatsappApi}
                onChange={(e) => setSelectedWhatsappApi(e.target.value)}
                labelId="conexao-label"
              >
                <MenuItem value={""}>Sem conexão</MenuItem>
                {whatsAppApis.map((whasapp) => (
                  <MenuItem key={whasapp.id} value={whasapp.id}>
                    {whasapp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel id="conexao-page">Página</InputLabel>
              <Select
                id="metaId"
                name="metaId"
                value={selectedMeta}
                onChange={(e) => setSelectedMeta(e.target.value)}
                labelId="conexao-page"
              >
                <MenuItem value={""}>Sem Página</MenuItem>
                {metas.map((meta) => (
                  <MenuItem key={meta.id} value={meta.id}>
                    {meta.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className={classes.autoFinishWrapper}>
              <FormControlLabel
                label="Habilitar a finalização automática do ChatBot"
                control={
                  <Switch
                    checked={autoFinish}
                    onChange={handleAutoFinishSwitch}
                    color="primary"
                  />
                }
              />

              {autoFinish && (
                <>
                  <TextField
                    label="Segundos"
                    name="autoFinishSeconds"
                    margin="dense"
                    variant="outlined"
                    type="number"
                    defaultValue={1}
                    className={classes.textField}
                    data-disabled={!autoFinish}
                    disabled={!autoFinish}
                  />
                  <FormControl variant="outlined" className={classes.maxWidth}>
                    <TextField
                      id="autoFinishMessage"
                      name="autoFinishMessage"
                      label="Mensagem de Finalização Automática"
                      multiline
                    />
                  </FormControl>
                </>
              )}
            </div>
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
              Criar
            </ButtonWithSpinner>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

export default BotModal;
