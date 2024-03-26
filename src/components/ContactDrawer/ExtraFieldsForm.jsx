import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";

import ConfirmationModal from "../ConfirmationModal";
import { i18n } from "../../translate/i18n";

import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Popover,
  TextField,
  Tooltip,
} from "@material-ui/core";
import api from "../../services/api";
import ImageModal from "../ImageModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { getAWSUrl } from "../../config";

const useStyles = makeStyles((theme) => ({
  details: {
    width: "60%",
    display: "flex",
    flexDirection: "column",
  },

  cover: {
    height: 150,
    width: 150,
    objectFit: "cover",
    boxShadow: "-1px 0px 13px 7px rgba(0, 0, 0, 0.4)",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },

  header: {
    display: "flex",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: "#eee",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    minHeight: "73px",
    justifyContent: "flex-start",
  },
  content: {
    backgroundColor: "#f5f5f5",
    minHeight: "110vh",
  },

  contactExtraInfo: {
    marginBottom: "1em",
    padding: 6,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  disabled: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    pointerEvents: "none",
  },
}));

const imageTypes = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"];

export const ExtraFieldsForm = ({
  contact,
  setContact,
  fields,
  setFields,
  contactInfos,
  setContactInfos,
  ticketId,
  contactDrawerOpen,
}) => {
  const classes = useStyles();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [editingValue, setEditingValue] = useState("");
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editing, setEditing] = useState(false);
  const openPopOver = Boolean(anchorEl);
  const { user, track } = useContext(AuthContext);

  const URL = window.location.href;

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    setEditing(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setEditing(false);
  };

  const updateContactExtraInfo = async (name, fieldValue, type) => {
    let value, fieldId;

    if (typeof fieldValue.value === "string") {
      value = fieldValue.value;
      fieldId = fieldValue.fieldId;
    } else {
      const haveValue = contact.extraInfo
        ?.filter((info) => info.name === name)
        ?.map((info) => +info.value);

      if (haveValue.includes(+fieldValue.value)) {
        value = haveValue.filter((value) => value !== +fieldValue.value);
      } else {
        value =
          type === "multiOption"
            ? [...haveValue, +fieldValue.value]
            : +fieldValue.value;
      }
      fieldId = fieldValue.fieldId;
    }

    try {
      const { data } = await api.put(`/extrainfo/${contact.id}`, {
        name,
        value,
        fieldId,
        ticketId,
        type,
      });

      track(`Custom Field Value Change`, {
        "Custom Field Name": name,
        Origin: `${URL.split("/")[3]}`,
      });

      try {
        const { data: contactUpdated } = await api.get(
          `/contacts/${contact.id}`
        );

        const { data: fields } = await api.get("/extrainfo/field");

        setContactInfos(contactUpdated.extraInfo);
        setFields(fields);
        setContact(contactUpdated);
      } catch (error) {
        console.log(error);
      }
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const errorFunction = (field) => {
    const re = new RegExp(field.mask?.split("&")[0]);
    const val = contactInfos?.find(
      (info) => info?.name === field?.name && info.ticketId === ticketId
    )?.value;

    if (!re.test(val)) {
      return true;
    } else {
      return false;
    }
  };

  const handleDeleteMedia = async () => {
    const { fieldId, path, name, ticketId } = selectedInfo;

    try {
      const { data } = await api.put(`/extrainfo/${contact.id}`, {
        name,
        value: "",
        fieldId,
        path,
        ticketId,
        contactCustomFieldId: selectedInfo.id,
      });

      track(`Custom Field Value Change`, {
        "Custom Field Name": name,
        Origin: `${URL.split("/")[3]}`,
      });

      try {
        const { data: contactUpdated } = await api.get(
          `/contacts/${contact.id}`
        );
        setContactInfos(contactUpdated.extraInfo);
      } catch (error) {
        console.log(error);
      }
      setSelectedInfo(null);
      return data;
    } catch (error) {
      console.log(error);
      setSelectedInfo(null);
    }
  };

  const handleMediaValue = async (field, info) => {
    try {
      const { data } = await api.put(`/extrainfo/${contact.id}`, {
        name: field?.name,
        value: editingValue,
        fieldId: field.id,
        ticketId,
        path: info.path,
        edit: true,
        contactCustomFieldId: info.id,
      });

      try {
        const { data: contactUpdated } = await api.get(
          `/contacts/${contact.id}`
        );
        setContactInfos(contactUpdated.extraInfo);
      } catch (error) {
        console.log(error);
      }
      setSelectedInfo(null);
      return data;
    } catch (error) {
      console.log(error);
      setSelectedInfo(null);
    }
  };

  const handleAddMedia = async (e, field) => {
    if (!e.target.files) {
      return;
    }

    const img = e.target.files[0];
    e.preventDefault();
    let formData = new FormData();
    formData.append("file", img);
    await api.post("/extrainfo/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const url = `${getAWSUrl() + img?.name}`;

    try {
      const { data } = await api.put(`/extrainfo/${contact.id}`, {
        name: field?.name,
        value: img?.name,
        fieldId: field.id,
        ticketId,
        path: url,
      });

      track(`Custom Field Value Change`, {
        "Custom Field Name": field?.name,
        Origin: `${URL.split("/")[3]}`,
      });

      try {
        const { data: contactUpdated } = await api.get(
          `/contacts/${contact.id}`
        );
        setContactInfos(contactUpdated.extraInfo);
      } catch (error) {
        console.log(error);
      }
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleMenuItemClick = async (field, options) => {
    if (options.value === "") {
      try {
        const { data: contactUpdated } = await api.delete(
          `/extrainfo/contactextrainfo/${contact.id}`,
          {
            data: {
              fieldId: field.id,
              userId: user.id,
            },
          }
        );
        setContactInfos(contactUpdated.extraInfo);
        setContact(contactUpdated);
        setSelectedInfo(null);

        const { data: fields } = await api.get("/extrainfo/field");
        setFields(fields);
      } catch (err) {
        console.log("erro", err.response.data);
      }
    } else {
      options.value = options.id;
      await updateContactExtraInfo(field.name, options, "singleOption");
    }
  };

  const isDisabled = (field) => {
    return field.onlyAdmin ? user?.profile !== "admin" : false;
  };

  return (
    <>
      <ConfirmationModal
        title={"Apagar mídia?"}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={() => handleDeleteMedia()}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>

      {fields?.sort((field, nextField) => {
				if ((field.order || 1) > (nextField.order || 1)) {
					return 1;
				} else if ((field.order || 1) === (nextField.order || 1)) {
					// Se os campos têm a mesma ordem, verificar em ordem alfabética
					if (field.name > nextField.name) {
							return 1;
					} else if (field.name < nextField.name) {
							return -1;
					} else {
							return 0;
					}
				} else {
					return -1;
				}
			})
			.map((field) => (
        <Paper
          key={field.id}
          square
          className={`${classes.contactExtraInfo} ${
            isDisabled(field) && classes.disabled
          }`}
        >
          <InputLabel
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
            id="inputMedia"
          >
            {field.type === "media" ? (
              <>
                {field?.name}

                <Button
                  component="label"
                  size="small"
                  variant="contained"
                  color="primary"
                  style={{
                    margin: 0,
                    padding: "0 0.8em",
                    fontSize: "0.7rem",
                  }}
                >
                  Adicionar Mídia
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      handleAddMedia(e, field);
                    }}
                  />
                </Button>
              </>
            ) : (
              field?.name
            )}
          </InputLabel>
          {field.type === "text" && (
            <Typography component="div" noWrap style={{ paddingTop: 2 }}>
              <Tooltip title={field.description ?? ""}>
                {field.mask?.split("&")[1] === "DATA" ? (
                  <TextField
                    variant="outlined"
                    size="small"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={(() => {
                      const value = contactInfos?.find(
                        (info) => info?.name === field?.name
                      )?.value;

                      if (value?.includes("/")) {
                        return value.split("/").reverse().join("-");
                      }
                      return value;
                    })()}
                    onChange={({ target: { value } }) => {
                      updateContactExtraInfo(field?.name, {
                        fieldId: field.id,
                        value,
                      });
                    }}
                  />
                ) : (
                  <TextField
                    style={{ width: "100%" }}
                    value={
                      contactInfos?.find((info) => info?.name === field?.name)
                        ?.value
                    }
                    defaultValue={field.value}
                    placeholder={field.example}
                    helperText={(() => {
                      const re = new RegExp(field.mask?.split("&")[0]);
                      const val = contactInfos?.find(
                        (info) => info?.name === field?.name
                      )?.value;

                      if (!re.test(val)) {
                        return `valor inválido, exemplo: ${field.example}`;
                      } else {
                        return "";
                      }
                    })()}
                    error={errorFunction(field)}
                    onChange={({ target: { value } }) => {
                      if (field.mask?.split("&")[1] === "R$") {
                        let newValue = value.trim();

                        if (!(newValue.slice(0, 3) === "R$ ")) {
                          newValue = `R$ ${newValue}`;
                        }

                        setContactInfos((e) => {
                          return [
                            ...e.filter((info) => info?.name !== field?.name),
                            {
                              name: field?.name,
                              value: newValue,
                            },
                          ];
                        });
                      } else if (!field.mask?.split("&")[2]) {
                        setContactInfos((e) => {
                          return [
                            ...e.filter((info) => info?.name !== field?.name),
                            {
                              name: field?.name,
                              value,
                            },
                          ];
                        });
                      } else if (field.mask?.split("&")[2]) {
                        const mask = new RegExp(field.mask?.split("&")[1]);
                        let maskGroups = field.mask?.split("&")[2].split("");
                        let matchString = "";
                        const match = value
                          .replace(/[^a-zA-Z0-9 ]/g, "")
                          .replace(/\s/g, "")
                          .match(mask);

                        if (match) {
                          // matchString = `${match[1]}}`
                          maskGroups.forEach((symbol, index) => {
                            matchString =
                              matchString +
                              `${match[index + 1] ? `${symbol}` : ""}${
                                match[index + 1] || ""
                              }`;
                          });
                        }

                        if (
                          !contactInfos
                            .map((info) => info?.name)
                            .includes(field?.name)
                        ) {
                          contactInfos.push({
                            name: field?.name,
                            value: matchString.replace(/\s/g, ""),
                          });
                        }

                        setContactInfos(() =>
                          contactInfos
                            .map((info) => info?.name)
                            .includes(field?.name)
                            ? [
                                ...contactInfos.filter(
                                  (info) => info?.name !== field?.name
                                ),
                                {
                                  name: field?.name,
                                  value: matchString.replace(/\s/g, ""),
                                },
                              ]
                            : contactInfos.push({
                                name: field?.name,
                                value: matchString.replace(/\s/g, ""),
                              })
                        );
                      } else {
                        console.log({
                          else: contactInfos.map((info) => {
                            if (info?.name === field?.name) {
                              return {
                                ...info,
                                value,
                              };
                            }
                            return info;
                          }),
                        });

                        setContactInfos((e) => {
                          return [
                            ...e.filter((info) => info?.name !== field?.name),
                            {
                              name: field?.name,
                              value,
                            },
                          ];
                        });
                      }
                    }}
                    onBlur={(e) => {
                      const re = new RegExp(field.mask?.split("&")[0]);

                      const val = e.target.value;

                      re.test(val) &&
                        updateContactExtraInfo(field?.name, {
                          fieldId: field.id,
                          value: e.target.value,
                        });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateContactExtraInfo(field?.name, {
                          fieldId: field.id,
                          value: e.target.value,
                        });
                      }
                    }}
                  />
                )}
              </Tooltip>
            </Typography>
          )}

          {field.type === "singleOption" && (
            <Tooltip title={field.description ?? ""}>
              <TextField
                select
                style={{ width: "100%" }}
                defaultValue={
                  contact.extraInfo?.find((info) => info.name === field.name)
                    ?.value || ""
                }
              >
                <MenuItem
                  key={""}
                  value={""}
                  onClick={() => {
                    handleMenuItemClick(field, { id: "", value: "" });
                  }}
                >
                  Nenhum (a)
                </MenuItem>
                {field.options?.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                    onClick={() => {
                      const actualValue =
                        contact.extraInfo?.find(
                          (info) => info.name === field.name
                        )?.value || "";
                      if (actualValue != option.id) {
                        return handleMenuItemClick(field, option);
                      }
                    }}
                  >
                    {option.value}
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>
          )}

          {field.type === "multiOption" &&
            field.options.map((option) => {
              let result;
              try {
                result =
                  contactInfos
                    ?.filter(
                      (info) =>
                        info?.name === field?.name &&
                        (info.ticketId === ticketId || !info.ticketId)
                    )
                    ?.map((info) => +info.value) || [];
              } catch (error) {
                const contactInfo = contactInfos?.find(
                  (info) =>
                    info?.name === field?.name &&
                    (info.ticketId === ticketId || !info.ticketId)
                );
                setContactInfos(
                  contactInfos.map((contact) => {
                    if (contact.id === contactInfo.id) {
                      return { ...contactInfo, value: [] };
                    }
                    return contact;
                  })
                );
                result = [];
              } finally {
                return result.includes(option.id) ? (
                  <Tooltip title={field.description ?? ""}>
                    <Chip
                      key={option.id}
                      label={option.value}
                      className={classes.chip}
                      color="primary"
                      // disabled
                      size="small"
                      onClick={() => {
                        updateContactExtraInfo(
                          field?.name,
                          {
                            fieldId: field.id,
                            value: +option.id,
                          },
                          "multiOption"
                        );

                        contactInfos.forEach((info) => {
                          if (
                            info?.name === field?.name &&
                            info.ticketId === ticketId
                          ) {
                            setContactInfos([
                              ...contactInfos.filter(
                                (inf) => inf?.name !== field?.name
                              ),
                              {
                                name: info?.name,
                                value: option.value,
                              },
                            ]);
                          }
                        });
                      }}
                      style={{ margin: 2 }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title={field.description ?? ""}>
                    <Chip
                      key={option.id}
                      label={option.value}
                      className={classes.chip}
                      color="primary"
                      variant="outlined"
                      // disabled
                      size="small"
                      onClick={() => {
                        updateContactExtraInfo(
                          field?.name,
                          {
                            fieldId: field.id,
                            value: +option.id,
                          },
                          "multiOption"
                        );

                        contactInfos.forEach((info) => {
                          if (
                            info?.name === field?.name &&
                            info.ticketId === ticketId
                          ) {
                            setContactInfos([
                              ...contactInfos.filter(
                                (inf) => inf?.name !== field?.name
                              ),
                              {
                                name: info?.name,
                                value: option.value,
                              },
                            ]);
                          }
                        });
                      }}
                      style={{ margin: 2 }}
                    />
                  </Tooltip>
                );
              }
            })}

          {field.type === "media" && (
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 5,
                gap: 1,
                width: "100%",
              }}
            >
              {contactInfos
                ?.filter(
                  (info) =>
                    info?.name === field?.name &&
                    ((info.ticketId && info.ticketId === ticketId) ||
                      !info.ticketId)
                )
                .sort((a, b) => a.value.localeCompare(b.value))
                .map((info) => {
                  return (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      style={{
                        width: "100%",
                      }}
                    >
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Tooltip
                          title="Visualizar"
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {imageTypes.includes(
                            // on path https:backendUrl.com.br/public/file.pdf select the extension after the dot
                            info?.path
                              .split("/")
                              [info?.path.split("/").length - 1].split(".")[1]
                          ) ? (
                            <ImageModal imageUrl={info?.path} />
                          ) : (
                            <Box
                              style={{
                                height: 40,
                                width: 30,
                                fontSize: "0.6em",
                                fontWeight: 900,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                backgroundColor: "grey",
                                borderRadius: 4,
                                marginRight: 5,
                                marginBottom: 7,
                                cursor: "pointer",
                              }}
                              // on click open tab with info.path
                              onClick={() => {
                                window.open(info.path, "_blank");
                              }}
                            >
                              <VisibilityIcon
                                style={{
                                  marginTop: "10px",
                                  fontSize: "1.9em",
                                }}
                              />
                              {`.${
                                info?.path
                                  .split("/")
                                  [info?.path.split("/").length - 1].split(
                                    "."
                                  )[1]
                              }`}
                            </Box>
                          )}
                        </Tooltip>

                        <Typography
                          style={{
                            fontSize: "0.8em",
                          }}
                        >
                          {info?.value}
                        </Typography>
                      </Box>

                      <Box display="flex">
                        <IconButton
                          onClick={(e) => {
                            handleClick(e);
                            setSelectedInfo(info);
                            setEditingValue(info.value);
                          }}
                        >
                          <EditIcon style={{ fontSize: "0.8em" }} />
                        </IconButton>
                        <Popover
                          id="edit-popover"
                          open={openPopOver && editing}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px 20px",
                            textAlign: "center",
                          }}
                        >
                          <TextField
                            label="Nome do documento"
                            size="small"
                            value={editingValue}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "10px 20px",
                              textAlign: "center",
                            }}
                            onChange={(e) => {
                              setEditingValue(e.target.value);
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={(e) => {
                                      setEditing(false);
                                      setAnchorEl(null);
                                      handleMediaValue(field, selectedInfo);
                                      setEditingValue("");
                                    }}
                                  >
                                    <SaveIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setEditing(false);
                                setAnchorEl(null);
                                handleMediaValue(field, selectedInfo);
                                setEditingValue("");
                              }
                            }}
                          />
                        </Popover>
                        <IconButton
                          onClick={(e) => {
                            setSelectedInfo(info);
                            setConfirmationOpen(true);
                            // e.target.value = "";
                            // handleMediaValue(e, field, info);
                          }}
                        >
                          <DeleteIcon style={{ fontSize: "0.8em" }} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                  // }
                })}
            </Box>
          )}
        </Paper>
      ))}
    </>
  );
};
