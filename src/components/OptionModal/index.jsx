import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import HelpOutline from "@material-ui/icons/HelpOutline";
import {
  AppBar,
  IconButton,
  makeStyles,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import api from "../../services/api";
import { Form, Formik } from "formik";
import useQueues from "../../hooks/useQueues";
import CustomFileViewer from "../CustomFileViewer";
import DefaultWildCardsDisplay from "../DefaultWildCardsDisplay";
import toastError from "../../errors/toastError";

import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
    marginBottom: 5,
  },
}));

const actionList = ["Sair", "Perguntar", "Chamada API"];

const textInQuestion = `Será enviado um objeto em formato JSON com as seguintes chaves: 
	ticketId: string | number,
	contact: {
		id: string | number,
		name: string,
		phoneNumber: string,
		profilePicUrl: string
	},
	lastMessage: string,
	lastMessageDate: string,
	option: {
		id: string | number,
		name: string,
		headerMessage: string,
		body: string,
		footerMessage: string,
		headerTransition: string,
		bodyTransition: string,
		footerTransition: string
	}
`;

const OptionModal = ({
  modalOpen,
  onClose,
  chatBotId,
  parentId,
  getChatBots,
  option,
}) => {
  const [loading, setLoading] = useState(false);
  const [queues, setQueues] = useState([]);
  const { findAll: findAllQueues } = useQueues();
  const [fields, setFields] = useState([]);
  const classes = useStyles();

  const [name, setName] = useState("");
  const [headerMessage, setHeaderMessage] = useState("");
  const [body, setBody] = useState("");
  const [footerMessage, setFooterMessage] = useState("");

  const [mediaHeader, setMediaHeader] = useState(null);
  const [mediaBody, setMediaBody] = useState(null);
  const [mediaFooter, setMediaFooter] = useState(null);

  const [action, setAction] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [queueId, setQueueId] = useState("");

  const [headerMessageTransition, setHeaderMessageTransition] = useState(null);
  const [bodyTransition, setBodyTransition] = useState(null);
  const [footerMessageTransition, setFooterMessageTransition] = useState(null);

  const [mediaHeaderTransition, setMediaHeaderTransition] = useState(null);
  const [mediaBodyTransition, setMediaBodyTransition] = useState(null);
  const [mediaFooterTransition, setMediaFooterTransition] = useState(null);

  const [skipQuestion, setSkipQuestion] = useState(false);
  const [callbackWebhook, setCallbackWebhook] = useState("");

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadQueues = async () => {
      const list = await findAllQueues();
      setQueues(list);
    };
    loadQueues();
  }, []);

  useEffect(() => {
    option && setFieldsData();
  }, [modalOpen]);

  useEffect(() => {
    const loadFields = async () => {
      try {
        const { data: fields } = await api.get("/extrainfo/field");
        const textFields = fields.filter((filter) => filter.type === "text");
        setFields(textFields);
      } catch (error) {
        toastError(error);
      }
    };
    loadFields();
  }, []);

  const setFieldsData = () => {
    setName(option.name || "");
    setHeaderMessage(option.headerMessage || "");
    setBody(option.body || "");
    setFooterMessage(option.footerMessage || "");

    setHeaderMessageTransition(option.headerMessageTransition || "");
    setBodyTransition(option.bodyTransition || "");
    setFooterMessageTransition(option.footerMessageTransition || "");

    setMediaHeader(option.mediaHeader || null);
    setMediaBody(option.mediaBody || null);
    setMediaFooter(option.mediaFooter || null);

    setMediaHeaderTransition(option.mediaHeaderTransition || null);
    setMediaBodyTransition(option.mediaBodyTransition || null);
    setMediaFooterTransition(option.mediaFooterTransition || null);

    setQueueId(option.queueId || "");
    setFieldId(option.fieldId || "");
    setAction(option.action || "");
    setSkipQuestion(Boolean(option.skipQuestion) || false);
    setCallbackWebhook(option.callbackWebhook || "");
  };

  const handleClose = () => {
    setActiveTab(0);
    onClose();
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return "";
    }

    const selectedMedia = e.target.files[0];
    selectedMedia.nameMedia = e.target.name;

    switch (e.target.name) {
      case "mediaHeader":
        setMediaHeader(selectedMedia);
        break;
      case "mediaBody":
        setMediaBody(selectedMedia);
        break;
      case "mediaFooter":
        setMediaFooter(selectedMedia);
        break;
      case "mediaHeaderTransition":
        setMediaHeaderTransition(selectedMedia);
        break;
      case "mediaBodyTransition":
        setMediaBodyTransition(selectedMedia);
        break;
      case "mediaFooterTransition":
        setMediaFooterTransition(selectedMedia);
        break;
      default:
        break;
    }
  };

  const cleanForm = () => {
    setName("");
    setHeaderMessage("");
    setBody("");
    setFooterMessage("");
    setMediaHeader(null);
    setMediaBody(null);
    setMediaFooter(null);
    setAction("");
    setFieldId("");
    setQueueId("");
    setHeaderMessageTransition("");
    setBodyTransition("");
    setFooterMessageTransition("");
    setMediaHeaderTransition(null);
    setMediaBodyTransition(null);
    setMediaFooterTransition(null);
    setSkipQuestion(false);

    setLoading(false);
    getChatBots();
    handleClose();
  };

  const createOption = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    formData.append("medias", mediaHeader);
    formData.append("medias", mediaBody);
    formData.append("medias", mediaFooter);
    formData.append("medias", mediaHeaderTransition);
    formData.append("medias", mediaBodyTransition);
    formData.append("medias", mediaFooterTransition);

    formData.append("mediaHeader", mediaHeader?.name || mediaHeader || "");
    formData.append("mediaBody", mediaBody?.name || mediaBody || "");
    formData.append("mediaFooter", mediaFooter?.name || mediaFooter || "");
    formData.append(
      "mediaHeaderTransition",
      mediaHeaderTransition?.name || mediaHeaderTransition || ""
    );
    formData.append(
      "mediaBodyTransition",
      mediaBodyTransition?.name || mediaBodyTransition || ""
    );
    formData.append(
      "mediaFooterTransition",
      mediaFooterTransition?.name || mediaFooterTransition || ""
    );

    if (mediaHeader === "") formData.set("mediaHeader", "");
    if (mediaBody === "") formData.set("mediaBody", "");
    if (mediaFooter === "") formData.set("mediaFooter", "");
    if (mediaHeaderTransition === "") formData.set("mediaHeaderTransition", "");
    if (mediaBodyTransition === "") formData.set("mediaBodyTransition", "");
    if (mediaFooterTransition === "") formData.set("mediaFooterTransition", "");

    formData.append("chatBotId", chatBotId);
    parentId
      ? formData.append("parentId", parentId)
      : formData.append("parentId", null);

    formData.append("name", name);
    formData.append("headerMessage", headerMessage);
    formData.append("body", body);
    formData.append("footerMessage", footerMessage);

    formData.append("headerMessageTransition", headerMessageTransition);
    formData.append("bodyTransition", bodyTransition);
    formData.append("footerMessageTransition", footerMessageTransition);

    formData.append("fieldId", fieldId);
    formData.append("action", action);
    formData.append("queueId", queueId);

		formData.append("callbackWebhook", callbackWebhook);

    if (fieldId) {
      formData.append("skipQuestion", skipQuestion);
    } else {
      formData.append("skipQuestion", false);
    }

    option
      ? await api.put(`/option/${option.id}`, formData)
      : await api.post("/option", formData);

    cleanForm();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">
        {option ? "Editar Opção" : "Nova Opção"}
      </DialogTitle>
      <DefaultWildCardsDisplay />

      <AppBar position="static">
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Opção" />
          {action === "Perguntar" && <Tab label="Transição" />}
        </Tabs>
      </AppBar>

      <Formik>
        <Form onSubmit={createOption} encType="multipart/form-data">
          {activeTab === 0 && (
            <DialogContent dividers>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="name"
                  name="name"
                  label="Opção"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="headerMessage"
                  name="headerMessage"
                  label="Cabeçalho"
                  multiline
                  minRows={3}
                  value={headerMessage}
                  onChange={(e) => setHeaderMessage(e.target.value)}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaHeader"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => setMediaHeader("")}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>

                <div>
                  {option?.mediaHeader && mediaHeader && (
                    <CustomFileViewer
                      imageUrl={`public/${option?.mediaHeader}`}
                      previousMedia={true}
                    />
                  )}

                  {mediaHeader?.name && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(mediaHeader)}
                      name={mediaHeader.name}
                    />
                  )}
                </div>
              </FormControl>

              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="body"
                  name="body"
                  label="Corpo"
                  multiline
                  minRows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaBody"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => setMediaBody("")}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
                <div>
                  {option?.mediaBody && mediaBody && (
                    <CustomFileViewer
                      imageUrl={`public/${option?.mediaBody}`}
                      previousMedia={true}
                    />
                  )}

                  {mediaBody?.name && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(mediaBody)}
                      name={mediaBody.name}
                    />
                  )}
                </div>
              </FormControl>

              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="footerMessage"
                  name="footerMessage"
                  label="Rodapé"
                  multiline
                  minRows={3}
                  value={footerMessage}
                  onChange={(e) => setFooterMessage(e.target.value)}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaFooter"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => setMediaFooter("")}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
                <div>
                  {option?.mediaFooter && mediaFooter && (
                    <CustomFileViewer
                      imageUrl={`public/${option?.mediaFooter}`}
                      previousMedia={true}
                    />
                  )}

                  {mediaFooter?.name && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(mediaFooter)}
                      name={mediaFooter.name}
                    />
                  )}
                </div>
              </FormControl>

              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Ação</InputLabel>
                <Select
                  id="action"
                  name="action"
                  label="Ação"
                  value={action}
                  onChange={(e) => {
                    if (e.target.value === "Perguntar") {
                      setFieldId("");
                    } else if (
                      ["Sair", "Chamada API", ""].includes(e.target.value)
                    ) {
                      setQueueId("");
                      setHeaderMessageTransition("");
                      setBodyTransition("");
                      setFooterMessageTransition("");
                      setMediaHeaderTransition(null);
                      setMediaBodyTransition(null);
                      setMediaFooterTransition(null);
                    }
                    return setAction(e.target.value);
                  }}
                >
                  <MenuItem value={""}>Sem Ação</MenuItem>
                  {actionList.map((action, i) => (
                    <MenuItem key={i} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {action === "Chamada API" && (
                <>
                  <FormControl variant="outlined" className={classes.maxWidth}>
                    <TextField
                      id="callbackWebhook"
                      name="callbackWebhook"
                      label="Digite o endpoint"
                      value={callbackWebhook}
                      onChange={(e) => setCallbackWebhook(e.target.value)}
                    />
                  </FormControl>
                  <Tooltip title={textInQuestion}>
                    <IconButton>
                      <HelpOutline />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {action === "Perguntar" && (
                <FormControl variant="outlined" className={classes.maxWidth}>
                  <InputLabel>Campos</InputLabel>
                  <Select
                    id="fieldId"
                    name="fieldId"
                    label="Campos"
                    value={fieldId}
                    onChange={(e) => setFieldId(e.target.value)}
                  >
                    <MenuItem value={""}>Sem Campo</MenuItem>
                    {fields.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {field.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {action === "Perguntar" && fieldId && (
                <FormControl variant="outlined" className={classes.maxWidth}>
                  <InputLabel>Pular Questão</InputLabel>
                  <Select
                    id="skipQuestion"
                    name="skipQuestion"
                    label="Pular Questão"
                    value={skipQuestion}
                    onChange={(e) => setSkipQuestion(e.target.value)}
                  >
                    <MenuItem value={true}>Ativado</MenuItem>
                    <MenuItem value={false}>Desativado</MenuItem>
                  </Select>
                </FormControl>
              )}

              {!["Perguntar", "Chamada API"].includes(action) && (
                <FormControl variant="outlined" className={classes.maxWidth}>
                  <InputLabel>Setor</InputLabel>
                  <Select
                    label="Setor"
                    id="queueId"
                    name="queueId"
                    value={queueId}
                    onChange={(e) => setQueueId(e.target.value)}
                  >
                    <MenuItem value={""}>Sem setor</MenuItem>
                    {queues.map((queue) => (
                      <MenuItem key={queue.id} value={queue.id}>
                        {queue.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </DialogContent>
          )}
          {activeTab === 1 && action === "Perguntar" && (
            <DialogContent dividers>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="headerMessageTransition"
                  name="headerMessageTransition"
                  label="Cabeçalho Transição"
                  multiline
                  minRows={3}
                  value={headerMessageTransition}
                  onChange={(e) => setHeaderMessageTransition(e.target.value)}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaHeaderTransition"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => setMediaHeaderTransition("")}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>

                <div>
                  {option?.mediaHeaderTransition && mediaHeaderTransition && (
                    <CustomFileViewer
                      imageUrl={`public/${option?.mediaHeaderTransition}`}
                      previousMedia={true}
                    />
                  )}

                  {mediaHeaderTransition?.name && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(mediaHeaderTransition)}
                      name={mediaHeaderTransition.name}
                    />
                  )}
                </div>
              </FormControl>

              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="bodyTransition"
                  name="bodyTransition"
                  label="Corpo"
                  multiline
                  minRows={3}
                  value={bodyTransition}
                  onChange={(e) => setBodyTransition(e.target.value)}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaBodyTransition"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => setMediaBodyTransition("")}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
                <div>
                  {option?.mediaBodyTransition && mediaBodyTransition && (
                    <CustomFileViewer
                      imageUrl={`public/${option?.mediaBodyTransition}`}
                      previousMedia={true}
                    />
                  )}

                  {mediaBodyTransition?.name && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(mediaBodyTransition)}
                      name={mediaBodyTransition.name}
                    />
                  )}
                </div>
              </FormControl>

              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  id="footerMessageTransition"
                  name="footerMessageTransition"
                  label="Rodapé"
                  multiline
                  minRows={3}
                  value={footerMessageTransition}
                  onChange={(e) => setFooterMessageTransition(e.target.value)}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaFooterTransition"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => setMediaFooterTransition("")}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
                <div>
                  {option?.mediaFooterTransition && mediaFooterTransition && (
                    <CustomFileViewer
                      imageUrl={`public/${option?.mediaFooterTransition}`}
                      previousMedia={true}
                    />
                  )}

                  {mediaFooterTransition?.name && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(mediaFooterTransition)}
                      name={mediaFooterTransition.name}
                    />
                  )}
                </div>
              </FormControl>
            </DialogContent>
          )}
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
        </Form>
      </Formik>
    </Dialog>
  );
};

export default OptionModal;
