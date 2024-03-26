import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Tabs,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import api from "../../services/api";
import { toast } from "react-toastify";
import CancelIcon from "@material-ui/icons/Cancel";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useStyles } from "./styles";

export default function TemplatesModal({
  isOpen,
  onClose,
  userId,
  ticketId,
  whatsappApiId,
}) {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [viewTemplate, setViewTemplate] = useState("done");
  const [selectedCard, setSelectedCard] = useState("");
  const [disabledButton, setDisabledButton] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [valueButtons, setValueButtons] = useState({
    buttonOne: "",
    buttonTwo: "",
  });
  const [preview, setPreview] = useState("");
  const [selectedButton, setSelectedButton] = useState("response-fast");
  const [quantityInputs, setQuantityInputs] = useState([]);

  const boxRef = useRef();

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.focus();
    }
  }, []);

  useEffect(() => {
    async function init() {
      if (!whatsappApiId) return;
      try {
        const response = await api.get("/whatsapp-api/templates", {
          params: {
            whatsappApiId,
          },
        });
        setTemplates(response.data || []);
      } catch (error) {
        setTemplates([]);
      }
    }
    init();
  }, [isOpen, viewTemplate, whatsappApiId]);

  const handleSendTemplate = async (id) => {
    setSelectedCard("");
    setDisabledButton(true);
    let templateMessage = "";
    let templateButtons = [];
    const templateSelected = templates.find((e) => e.id === id);
    templateSelected.components.forEach((component) => {
      if (component.text) {
        templateMessage = `${templateMessage} ${component.text}\n`;
      } else if (component.buttons) {
        component.buttons.forEach((button) => {
          templateButtons = [
            ...templateButtons,
            {
              type: button.type,
              text: button.text,
            },
          ];
        });
      }
    });

    const message = {
      read: 1,
      fromMe: true,
      body: templateMessage,
      userId,
      name: templateSelected.name,
      language: templateSelected.language,
      buttons: templateButtons.length > 0 ? templateButtons : undefined,
    };

    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (error) {
      toast.error("Erro ao enviar template");
    }

    onClose();
    setDisabledButton(false);
    setSelectedCard("");
  };

  const handleClose = () => {
    setPreview(false);
    onClose();
    setDisabledButton(false);
    setSelectedCard("");
    setName("");
    setCategory("UTILITY");
    setHeader("");
    setBody("");
    setFooter("");
    setQuantityInputs([]);
    setValueButtons({
      buttonOne: "",
      buttonTwo: "",
    });
  };

  const handleCreateTemplate = async () => {
    setDisabledButton(true);

    let componentsStructureText = {};

    if (header) {
      componentsStructureText = {
        ...componentsStructureText,
        header,
      };
    }

    if (body) {
      componentsStructureText = {
        ...componentsStructureText,
        body,
      };
    }

    if (footer) {
      componentsStructureText = {
        ...componentsStructureText,
        footer,
      };
    }

    let componentsStructureButtons = {};

    if (valueButtons.buttonOne) {
      componentsStructureButtons = {
        ...componentsStructureButtons,
        buttonOne: valueButtons.buttonOne,
      };
    }

    if (valueButtons.buttonTwo) {
      componentsStructureButtons = {
        ...componentsStructureButtons,
        buttonTwo: valueButtons.buttonTwo,
      };
    }

    const templateBody = {
      name: name.toLocaleLowerCase().replaceAll(" ", "_"),
      language: "pt_BR",
      category,
      components: [
        ...Object.entries(componentsStructureText).map(([key, value]) => {
          if (key === "header") {
            return {
              type: key.toLocaleUpperCase(),
              text: value,
              format: "TEXT",
            };
          }
          return {
            type: key.toLocaleUpperCase(),
            text: value,
          };
        }),
      ],
    };

    if (Object.keys(componentsStructureButtons).length > 0) {
      templateBody.components = [
        ...templateBody.components,
        {
          type: "BUTTONS",
          buttons: [
            ...Object.entries(componentsStructureButtons).map(
              ([key, value]) => {
                return {
                  type: "QUICK_REPLY",
                  text: value,
                };
              }
            ),
          ],
        },
      ];
    }

    try {
      await api.post(
        `/whatsapp-api/template/create/${whatsappApiId}`,
        templateBody
      );
      toast.success("Template criado com sucesso");
    } catch (error) {
      toast.error(`${error?.response?.data.error}`);
    }

    handleClose();
  };

  const handleNext = () => {
    if (body.length === 0) {
      return toast.error("O corpo da mensagem não pode ser vazio");
    }
    if (name.length === 0) {
      return toast.error("O nome do template não pode ser vazio");
    }
    if (!/^[a-zA-Z_ ]*$/.test(name)) {
      return toast.error(`O nome do template não pode ter numeros ou caracteres especiais,
				somente letras, espaços e underline.`);
    }
    if (category.length === 0) {
      return toast.error("A categoria do template não pode ser vazia");
    }
    setPreview(true);
  };

  return (
    <>
      {isOpen && (
        <Box className={classes.box} ref={boxRef} tabIndex={0}>
          <Tabs className={classes.tabs}>
            <CancelIcon
              style={{
                cursor: "pointer",
                position: "absolute",
                right: 5,
                top: 3,
              }}
              onClick={handleClose}
            />
            <Button
              onClick={() => setViewTemplate("done")}
              className={classes.tab}
              style={{
                fontWeight: viewTemplate === "done" ? "bold" : "normal",
                color: "black",
              }}
            >
              Templates Prontos
            </Button>
            {user.profile === "admin" && (
              <Button
                onClick={() => setViewTemplate("create")}
                className={classes.tab}
                style={{
                  fontWeight: viewTemplate === "create" ? "bold" : "normal",
                }}
              >
                Criar um template
              </Button>
            )}
          </Tabs>
          <main className={classes.main}>
            {viewTemplate === "done" &&
              templates.length > 0 &&
              templates.map((e) => (
                <div style={{ width: "50%" }}>
                  <Card
                    onClick={() => setSelectedCard(e.id)}
                    className={`${classes.Card} ${
                      selectedCard === e.id && classes.selectedCard
                    }`}
                  >
                    <CardContent className={classes.CardContent}>
                      <Typography variant="h6">
                        Nome do template: {e.name}
                      </Typography>
                      <br />
                      {e.components.map((component) => (
                        <>
                          <Typography variant="body1">
                            {component.text}
                          </Typography>
                          <br />
                          {component.buttons &&
                            component.buttons.map((button) => (
                              <div
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  flexDirection: "column",
                                }}
                              >
                                <Button
                                  size="medium"
                                  variant="contained"
                                  color="secondary"
                                  style={{
                                    backgroundColor: "#fceacd",
                                    color: "blue",
                                    marginBottom: "10px",
                                  }}
                                >
                                  {button.text}
                                </Button>
                              </div>
                            ))}
                        </>
                      ))}
                      <br />
                      <Typography variant="body2">
                        Linguagem: {e.language}
                      </Typography>
                      <Typography variant="body2">
                        Categoria: {e.category}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{
                          color: e.status === "APPROVED" ? "green" : "red",
                        }}
                      >
                        Status: {e.status}
                      </Typography>
                    </CardContent>
                    <Button
                      onClick={() => handleSendTemplate(e.id)}
                      disabled={disabledButton || e.status !== "APPROVED"}
                      size="medium"
                      variant="contained"
                      color="primary"
                      style={{
                        backgroundColor:
                          e.status !== "APPROVED" ? "gray" : '"#42722c"',
                      }}
                    >
                      Enviar
                    </Button>
                    <br />
                  </Card>
                </div>
              ))}
            {viewTemplate === "create" && (
              <>
                {preview ? (
                  <container className={classes.containerCreate}>
                    <Typography
                      variant="h6"
                      style={{
                        wordBreak: "break-word",
                        width: "80%",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {header}
                    </Typography>
                    <br />
                    <Typography
                      variant="body1"
                      style={{
                        width: "80%",
                        wordBreak: "break-word",
                        textAlign: "center",
                      }}
                    >
                      {body}
                    </Typography>
                    <br />
                    <Typography
                      variant="body2"
                      style={{
                        width: "80%",
                        wordBreak: "break-word",
                        textAlign: "center",
                      }}
                    >
                      {footer}
                    </Typography>
                    {(valueButtons.buttonOne || valueButtons.buttonTwo) && (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                        }}
                      >
                        {valueButtons.buttonOne && (
                          <Button
                            size="medium"
                            variant="contained"
                            color="secondary"
                            style={{
                              backgroundColor: "#fceacd",
                              color: "blue",
                            }}
                          >
                            {valueButtons.buttonOne}
                          </Button>
                        )}
                        {valueButtons.buttonTwo && (
                          <Button
                            size="medium"
                            variant="contained"
                            color="secondary"
                            style={{
                              backgroundColor: "#fceacd",
                              color: "blue",
                            }}
                          >
                            {valueButtons.buttonTwo}
                          </Button>
                        )}
                      </div>
                    )}
                    <br />
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                      }}
                    >
                      <br />
                      <Button
                        onClick={() => setPreview(false)}
                        size="medium"
                        variant="contained"
                        color="seucndary"
                        style={{ backgroundColor: "red", color: "white" }}
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={handleCreateTemplate}
                        size="medium"
                        variant="contained"
                        color="primary"
                        style={{ backgroundColor: "#42722c" }}
                      >
                        Criar
                      </Button>
                    </div>
                  </container>
                ) : (
                  <container className={classes.containerCreate}>
                    <TextField
                      label="Nome do Template"
                      variant="outlined"
                      style={{ width: "80%" }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <br />
                    <FormControl
                      margin="dense"
                      variant="outlined"
                      style={{ width: "80%" }}
                    >
                      <InputLabel htmlFor="category-select">
                        Categoria
                      </InputLabel>
                      <Select
                        style={{ width: "100%", zIndex: 1000 }}
                        label="Categoria"
                        labelWidth={60}
                        labelId="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <MenuItem value="MARKETING">MARKETING</MenuItem>
                        <MenuItem value="UTILITY">UTILITY</MenuItem>
                      </Select>
                    </FormControl>
                    <br />
                    <TextField
                      label="Cabeçalho"
                      variant="outlined"
                      style={{ width: "80%" }}
                      value={header}
                      onChange={(e) => setHeader(e.target.value)}
                    />
                    <TextField
                      label="Corpo"
                      variant="outlined"
                      style={{
                        width: "80%",
                        maxHeight: "150px",
                        flexGrow: 1,
                        overflowY: "auto",
                      }}
                      multiline
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                    <TextField
                      label="Rodapé"
                      variant="outlined"
                      style={{ width: "80%" }}
                      value={footer}
                      onChange={(e) => setFooter(e.target.value)}
                    />
                    <br />
                    <FormControl
                      margin="dense"
                      variant="outlined"
                      style={{ width: "80%" }}
                    >
                      <InputLabel htmlFor="button-select">Botões</InputLabel>
                      <Select
                        value={selectedButton}
                        style={{ width: "100%", zIndex: 1000 }}
                        label="Botões"
                        labelWidth={60}
                        labelId="button-select"
                        onChange={(e) => {
                          setSelectedButton(e.target.value);
                          if (e.target.value === "none") {
                            setQuantityInputs(["buttonOne"]);
                            setValueButtons({
                              buttonOne: "",
                              buttonTwo: "",
                            });
                          }
                        }}
                      >
                        <MenuItem value="response-fast">
                          Resposta Rápida
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <br />
                    {selectedButton === "response-fast" && (
                      <>
                        {quantityInputs.map((e) => (
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <TextField
                              label="Texto do Botão"
                              variant="outlined"
                              style={{ width: "80%" }}
                              value={valueButtons[e]}
                              onChange={(i) =>
                                setValueButtons({
                                  ...valueButtons,
                                  [e]: i.target.value,
                                })
                              }
                            />
                            <Button
                              size="medium"
                              variant="contained"
                              color="seucndary"
                              style={{ backgroundColor: "red", color: "white" }}
                              onClick={() => {
                                setValueButtons({ ...valueButtons, [e]: "" });
                                setQuantityInputs(
                                  quantityInputs.filter((i) => i !== e)
                                );
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        {quantityInputs.length <= 1 && (
                          <Button
                            size="medium"
                            variant="contained"
                            color="primary"
                            style={{ backgroundColor: "#42722c" }}
                            onClick={() => {
                              const filterQuantity = quantityInputs.filter(
                                (i) => i !== "buttonOne"
                              );
                              setQuantityInputs([
                                ...quantityInputs,
                                filterQuantity.length > 0
                                  ? "buttonOne"
                                  : "buttonTwo",
                              ]);
                            }}
                          >
                            {quantityInputs.length === 1
                              ? "Adicionar outro botão"
                              : "Adicionar botão"}
                          </Button>
                        )}
                      </>
                    )}
                    <br />
                    <Button
                      onClick={() => handleNext()}
                      size="medium"
                      variant="contained"
                      color="primary"
                      style={{ backgroundColor: "#42722c" }}
                    >
                      Avançar
                    </Button>
                  </container>
                )}
              </>
            )}
          </main>
        </Box>
      )}
    </>
  );
}
