import React, { useContext, useEffect, useRef, useState } from "react";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  makeStyles,
} from "@material-ui/core";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import { green } from "@material-ui/core/colors";
import DeleteIcon from "@material-ui/icons/Delete";
import MoodIcon from "@material-ui/icons/Mood";
import { Picker } from "emoji-mart";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import CustomFileViewer from "../CustomFileViewer";
import DefaultWildCardsDisplay from "../DefaultWildCardsDisplay";
import UserSelect from "../UserSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    width: "100%",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  textQuickAnswerContainer: {
    width: "100%",
  },

  quickMessageContainer: {
    alignItems: "flex-start",
    display: "flex",
    position: "relative",
    width: "100%",
  },

  emojiBox: {
    borderTop: "1px solid #e8e8e8",
  },
}));

const QuickAnswerSchema = Yup.object().shape({
  shortcut: Yup.string()
    .min(2, "Muito curto!")
    .max(100, "Muito longo!")
    .required("Obrigatório"),
  message: Yup.string().optional(),
});

const QuickAnswersModal = ({
  open,
  onClose,
  quickAnswerInfo,
  initialValues,
  onSave,
  setQuickAnswersCount,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const initialState = {
    shortcut: "",
    message: "",
  };

  const { user, track } = useContext(AuthContext);
  const [quickAnswer, setQuickAnswer] = useState(initialState);
  const [selectedUsers, setSelectedUsers] = useState([user.id]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [media, setMedia] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedia = e.target.files[0];

    selectedMedia.nameMedia = e.target.name;
    setMedia(selectedMedia);
  };

  const handleAddEmoji = (e, values) => {
    let emoji = e.native;

    let message = values.message;
    const cursor = cursorPosition;
    const start = message.substring(0, cursor);

    if (cursor === message.length) {
      message = start + emoji;
      setQuickAnswer({
        shortcut: values.shortcut,
        message,
      });

      setShowEmoji(false);
      return;
    }

    const end = message.substring(cursor);
    message = start + emoji + end;

    setQuickAnswer({
      shortcut: values.shortcut,
      message,
    });

    setShowEmoji(false);
  };

  const handleClose = () => {
    onClose();
    setSelectedUsers([user.id]);
    setQuickAnswer(initialState);
    setMedia();
  };

  const handleSaveQuickAnswer = async (values) => {
    const formData = new FormData();
    formData.append("medias", media);
    formData.append("shortcut", values.shortcut);
    formData.append("message", values.message);
    selectedUsers.forEach((user) => formData.append("userIds", user));

    try {
      formData.append("mediaUrl", media.name || mediaUrl);
    } catch {
      console.log("Sem Media");
    }
    if (mediaUrl === "" && !media.name) formData.set("mediaUrl", "");

    try {
      if (quickAnswerInfo?.id) {
        await api.put(`/quickAnswers/${quickAnswerInfo?.id}`, formData);
        track("Quick Answer Change", {
          Action: "Update",
        });
        handleClose();
      } else {
        const { data } = await api.post("/quickAnswers", formData);
        track("Quick Answer Change", {
          Action: "Create",
        });
        if (setQuickAnswersCount) {
          setQuickAnswersCount((prevState) => prevState + 1);
        }

        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("quickAnswersModal.success"));
    } catch (err) {
      toastError(err);
    }
    setMedia();
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (quickAnswerInfo) {
      setQuickAnswer({
        shortcut: quickAnswerInfo.shortcut,
        message: quickAnswerInfo.message,
      });
      setSelectedUsers(quickAnswerInfo.users.map((userInfo) => userInfo.id));
      setMediaUrl(quickAnswerInfo.mediaUrl);
    }
  }, [quickAnswerInfo?.id, open]);

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {quickAnswerInfo?.id
            ? `${i18n.t("quickAnswersModal.title.edit")}`
            : `${i18n.t("quickAnswersModal.title.add")}`}
        </DialogTitle>

        <DefaultWildCardsDisplay />

        <Formik
          initialValues={quickAnswer}
          enableReinitialize={true}
          validationSchema={QuickAnswerSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickAnswer(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.textQuickAnswerContainer}>
                  <Field
                    as={TextField}
                    label={i18n.t("quickAnswersModal.form.shortcut")}
                    name="shortcut"
                    autoFocus
                    error={touched.shortcut && Boolean(errors.shortcut)}
                    helperText={touched.shortcut && errors.shortcut}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    fullWidth
                  />
                </div>

                <div>
                  <UserSelect
                    selectedUsers={selectedUsers}
                    onChange={(values) => setSelectedUsers(values)}
                  />
                </div>

                <div className={classes.quickMessageContainer}>
                  <IconButton
                    aria-label="emojiPicker"
                    component="span"
                    onClick={(e) => setShowEmoji((prevState) => !prevState)}
                  >
                    <MoodIcon className={classes.sendMessageIcons} />
                  </IconButton>

                  <Dialog open={showEmoji} className={classes.emojiBox}>
                    <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                      <Picker
                        style={{ backgroundColor: "#fff" }}
                        perLine={16}
                        showPreview={false}
                        showSkinTones={false}
                        onSelect={(e) => handleAddEmoji(e, values)}
                      />
                    </ClickAwayListener>
                  </Dialog>

                  <Field
                    as={TextField}
                    label={i18n.t("quickAnswersModal.form.message")}
                    name="message"
                    error={touched.message && Boolean(errors.message)}
                    helperText={touched.message && errors.message}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    multiline
                    rows={5}
                    fullWidth
                    onKeyUp={(e) => {
                      setCursorPosition(e.target.selectionEnd);
                    }}
                    onClick={(e) => {
                      setCursorPosition(e.target.selectionEnd);
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <input
                    name="mediaUrl"
                    type="file"
                    onChange={handleChangeMedias}
                    style={{
                      color: "transparent",
                      overflow: "hidden",
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      setMedia("");
                      setMediaUrl("");
                    }}
                    style={{ padding: "0px" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>

                <div>
                  {mediaUrl && (
                    <CustomFileViewer
                      imageUrl={mediaUrl}
                      previousMedia={true}
                    />
                  )}

                  {media && (
                    <CustomFileViewer
                      imageUrl={URL.createObjectURL(media)}
                      name={media.name}
                    />
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("quickAnswersModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {quickAnswerInfo?.id
                    ? `${i18n.t("quickAnswersModal.buttons.okEdit")}`
                    : `${i18n.t("quickAnswersModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default QuickAnswersModal;
