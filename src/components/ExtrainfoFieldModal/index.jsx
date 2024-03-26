import React, { useState, useEffect, useContext } from "react";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  InputBase,
  MenuItem,
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import EditableChip from "../EditableChip";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    width: "46%",
    margin: theme.spacing(1),
    flex: 1,
  },

  maskField: {
    width: "75%",
    margin: theme.spacing(1),
    flex: 1,
  },

  defaultMasks: {
    width: "17%",
    margin: theme.spacing(1),
    flex: 1,
  },

  largeTextField: {
    width: "95%",
    margin: theme.spacing(1),
    flex: 1,
  },

  container: {
    display: "flex",
    flexWrap: "wrap",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },

  chip: {
    // display: "flex",
    textAlign: "center",
  },
}));

const INITAL_FIELD = {
  type: "text",
  options: [],
};

const ExtrainfoFieldModal = ({
  open,
  onClose,
  selectedField,
  setSelectedField,
	nextOrder
}) => {
  const [field, setField] = useState(INITAL_FIELD);
  const [addingNewOption, setAddingNewOption] = useState(false);
  const [newOption, setNewOption] = useState("");
  const classes = useStyles();

  const { user, track } = useContext(AuthContext);

  useEffect(() => {
    if (!selectedField) {
      setField(INITAL_FIELD);
    } else {
      setField(selectedField);
    }
  }, [selectedField]);

  const handleClose = () => {
    onClose();
    setAddingNewOption(false);
    setField({ type: "text", options: [] });
  };

  const handleSaveField = async (field) => {
    try {
      if (selectedField) {
        await api.put(`/extrainfo/field/${selectedField.id}`, field);
        track("Custom Field Change", {
          Field: field.name,
          Action: "Edit",
        });
      } else {
        await api.post(`/extrainfo/field/`, field);
        track("Custom Field Change", {
          Field: field.name,
          Action: "Create",
        });
      }
      toast.success(`Campo salvo com sucesso!`);
      setSelectedField(null);
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await api.delete(`/extrainfo/option/${optionId}`);
      toast.success(`Opção deletada com sucesso!`);
      setSelectedField({
        ...field,
        options: [...field.options.filter((option) => option.id !== optionId)],
      });
    } catch (err) {
      toastError(err);
    }
  };

  const handleUpdateOption = async (optionId, value) => {
    try {
      const { data } = await api.put(`/extrainfo/option/${optionId}`, {
        value,
      });
      toast.success(`Opção atualizada com sucesso!`);
      setSelectedField({
        ...field,
        options: field.options.map((option) =>
          option.id === optionId ? data : option
        ),
      });
      setNewOption("");
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const handleAddOption = async () => {
    let newField;

    if (!selectedField) {
      try {
        const { data } = await api.post(`/extrainfo/field/`, field);
        track("Custom Field Change", {
          Field: field.name,
          Action: "Create",
        });
        newField = data;
        setSelectedField(data);
        try {
          const { data: option } = await api.post(`/extrainfo/option/`, {
            value: newOption,
            fieldId: data.id,
          });
          toast.success(`Opção adicionada com sucesso!`);
          setSelectedField({
            ...data,
            options: [option],
          });
          setNewOption("");
        } catch (err) {
          console.log(err);
          toastError(err);
        }
      } catch (err) {
        console.log(err);
        toastError(err);
      }
    } else {
      try {
        const { data } = await api.post(`/extrainfo/option/`, {
          value: newOption,
          fieldId: selectedField.id || newField.id,
        });
        toast.success(`Opção adicionada com sucesso!`);
        setSelectedField({
          ...field,
          options: [...field.options, data],
        });
        setNewOption("");
      } catch (err) {
        console.log(err);
        toastError(err);
      }
    }
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} scroll="paper">
        <DialogTitle>
          {selectedField ? `Editar campo` : `Adicionar campo`}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Nome"
            autoFocus
            name="name"
            variant="outlined"
            margin="dense"
            placeholder="exemplo: Email"
            // disabled={selectedField}
            defaultValue={selectedField?.name || ""}
            onChange={(e) => setField({ ...field, name: e.target.value })}
            className={classes.textField}
          />
          <TextField
            label="Tipo"
            name="type"
            variant="outlined"
            margin="dense"
            // disabled={selectedField}
            select
            defaultValue={selectedField?.type || "text"}
            onChange={(e) => setField({ ...field, type: e.target.value })}
            className={classes.textField}
          >
            <MenuItem value="text">Texto</MenuItem>
            <MenuItem value="singleOption">Opção única</MenuItem>
            <MenuItem value="multiOption">Multipla escolha</MenuItem>
            <MenuItem value="media">Arquivos</MenuItem>
          </TextField>
          <TextField
            style={{
              width: "95%",
            }}
            label="Contexto"
            name="context"
            variant="outlined"
            margin="dense"
            // disabled={selectedField}
            select
            defaultValue={selectedField?.context || "contact"}
            onChange={(e) => setField({ ...field, context: e.target.value })}
            className={classes.textField}
          >
            <MenuItem value="contact">Contato</MenuItem>
            <MenuItem value="ticket">Ticket</MenuItem>
          </TextField>
          {field?.type === "text" && (
            <>
              <TextField
                label="Máscara"
                name="mask"
                variant="outlined"
                margin="dense"
                value={field.mask}
                defaultValue={selectedField?.mask || ""}
                onChange={(e) => setField({ ...field, mask: e.target.value })}
                className={classes.maskField}
              />
              <TextField
                select
                // label="padrões"
                name="exampleMasks"
                margin="dense"
                variant="outlined"
                onChange={(e) => {
                  setField({ ...field, mask: e.target.value });
                }}
                className={classes.defaultMasks}
              >
                <MenuItem value="^(([0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2})|([0-9]{11}))$&^(\d{1,3})(\d{0,3})(\d{0,3})(\d{0,2})$& ..-">
                  CPF
                </MenuItem>
                <MenuItem value="^(([0-9]{2}.[0-9]{3}.[0-9]{3}/[0-9]{4}-[0-9]{2})|([0-9]{14}))$&^(\d{1,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$& ../-">
                  CNPJ
                </MenuItem>
                <MenuItem value="^(([0-9]{5}-[0-9]{3})|([0-9]{8}))$&^(\d{1,5})(\d{0,3})$& -">
                  CEP
                </MenuItem>
                <MenuItem value="^(?:(?:\+|00)?(55)\s?)?(?:(?:\(?[1-9][0-9]\)?)?\s?)?(?:((?:9\d|[2-9])\d{3})-?(\d{4}))$&^(\d{1,2})(\d{0,5})(\d{0,4})$&()--">
                  CELULAR
                </MenuItem>
                <MenuItem value='^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'>
                  E-MAIL
                </MenuItem>
                <MenuItem value="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}$&DATA">
                  DATA
                </MenuItem>
                <MenuItem value="^R\$ \d+(?:\.\d{1,2})?$&R$">R$</MenuItem>
              </TextField>

              <TextField
                style={{ width: "95%" }}
                label="Exemplo"
                multiline
                name="example"
                variant="outlined"
                margin="dense"
                placeholder="exemplo: joão@gmail.com"
                defaultValue={selectedField?.example || ""}
                onChange={(e) =>
                  setField({ ...field, example: e.target.value })
                }
                className={classes.textField}
              />
            </>
          )}
          {(field?.type === "singleOption" ||
            field?.type === "multiOption") && (
            <>
              {!addingNewOption ? (
                <Chip
                  avatar={<Avatar>+</Avatar>}
                  label="Adicionar opção"
                  variant="outlined"
                  onClick={() => {
                    setAddingNewOption(true);
                  }}
                  className={classes.chip}
                />
              ) : (
                <Chip
                  // avatar={<Avatar>+</Avatar>}
                  label={
                    <InputBase
                      label="Nova opção"
                      name="newOption"
                      margin="dense"
                      placeholder="digite a nova opção"
                      value={newOption}
                      defaultValue={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddOption();
                        }
                      }}
                      className={classes.textField}
                      inputProps={{ "aria-label": "naked" }}
                      style={{
                        fontSize: "1em",
                        width: "100%",
                        height: "100%",
                        marginBottom: 15,
                        textAlign: "center",
                        verticalAlign: "middle",
                        margin: "auto",
                        paddingTop: 3,
                      }}
                      endAdornment={
                        <InputAdornment
                          position="end"
                          style={{ marginRight: "-20px", marginBottom: "5px" }}
                          onClick={() => {
                            handleAddOption();
                          }}
                        >
                          <IconButton aria-label="toggle password visibility">
                            <Avatar style={{ height: "0.8em", width: "0.8em" }}>
                              +
                            </Avatar>
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  }
                  variant="outlined"
                  onClick={() => {
                    setAddingNewOption(true);
                  }}
                  className={classes.chip}
                />
              )}

              {selectedField?.options?.map((option, index) => {
                return (
                  <EditableChip
                    key={index}
                    initialValue={option.value}
                    onDelete={() => handleDeleteOption(option.id)}
                    onUpdate={(updatedValue) =>
                      handleUpdateOption(option.id, updatedValue)
                    }
                  />
                );
              })}
            </>
          )}
          <TextField
            label="Descrição"
            multiline
            name="description"
            variant="outlined"
            margin="dense"
            defaultValue={selectedField?.description || ""}
            onChange={(e) =>
              setField({ ...field, description: e.target.value })
            }
            className={classes.largeTextField}
          />

          {user?.profile === "admin" && (
            <TextField
              label="Somente Admin pode editar"
              name="onlyAdmin"
              variant="outlined"
              margin="dense"
              select
              defaultValue={selectedField?.onlyAdmin || false}
              onChange={(e) =>
                setField({ ...field, onlyAdmin: e.target.value })
              }
              className={classes.textField}
            >
              <MenuItem value={true}>Sim</MenuItem>
              <MenuItem value={false}>Não</MenuItem>
            </TextField>
          )}

					<TextField
						label="Ordem de exibição"
						name="order"
						variant="outlined"
						margin="dense"
						type="number"
						defaultValue={
							selectedField?.order ||
							nextOrder ||
							1
						}
						onChange={(e) =>
							setField({ ...field, order: e.target.value})
						}
						className={classes.textField}
					/>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {i18n.t("queueModal.buttons.cancel")}
          </Button>
          <Button
            onClick={() => handleSaveField(field)}
            color="primary"
            variant="contained"
            className={classes.btnWrapper}
          >
            {selectedField ? `Salvar` : `Criar`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtrainfoFieldModal;
