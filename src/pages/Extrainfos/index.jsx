import React, { useCallback, useEffect, useReducer, useState } from "react";

import {
  Button,
  Chip,
  Divider,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableHead,
  Typography,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import ExtrainfoFieldModal from "../../components/ExtrainfoFieldModal";
import { toast } from "react-toastify";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customStyledTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const Extrainfos = () => {
  const classes = useStyles();
  const [fields, setFields] = useState([]);
  const [openFieldModal, setOpenFieldModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: fields } = await api.get("/extrainfo/field");
        setFields(fields);
      } catch (error) {
        toastError(error);
      }
    })();
  }, [openFieldModal]);

  const handleDeleteField = async (fieldId) => {
    try {
      await api.delete(`/extrainfo/field/${fieldId}`);
      toast.success(`Campo deletado com sucesso!`);
      setFields(fields.filter((field) => field.id !== fieldId));
    } catch (err) {
      toastError(err);
    }
  };

  const translateContext = (context) => {
    switch (context) {
      case "contact":
        return "Contato";
      case "ticket":
        return "Ticket";
      default:
        return "";
    }
  };

  return (
    <MainContainer>
      {/* {openFieldModal && <ExtrainfoFieldModal />} */}
      <ExtrainfoFieldModal
        open={openFieldModal}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        onClose={() => setOpenFieldModal(false)}
				nextOrder={!selectedField ? fields.reduce((acc, field) => {
					if ((field.order || 1) > acc) {
						return field.order;
					}
					return acc;
				}, 0) + 1 : undefined}
      />
      <MainHeader>
        <Title>Campos Personalizados</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedField(null);
              setOpenFieldModal(true);
            }}
          >
            Adicionar campo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        style={{ marginBottom: "5em" }}
      >
        <Typography variant="h6">Textuais</Typography>
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">Nome</StyledTableCell>
              <StyledTableCell align="center">Descrição</StyledTableCell>
              {/* <StyledTableCell align="center">
                Configuração
              </StyledTableCell> */}
              <StyledTableCell align="center">Mascara</StyledTableCell>
              <StyledTableCell align="center">Exemplo</StyledTableCell>
              <StyledTableCell align="center">Contexto</StyledTableCell>
							<StyledTableCell align="center">Ordem</StyledTableCell>
              <StyledTableCell align="center">Ações</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {fields
                ?.filter((field) => field.type === "text")
                ?.map((field) => (
                  <StyledTableRow key={field.id}>
                    <StyledTableCell align="center">
                      {field.name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.description}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      style={{
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {field.mask}
                    </StyledTableCell>
                    {/* <StyledTableCell align="center">{field.config}</StyledTableCell> */}
                    <StyledTableCell align="center">
                      {field.example}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {translateContext(field.context)}
                    </StyledTableCell>
										
										<StyledTableCell align="center">
                      {field.order || 1}
										</StyledTableCell>
                    
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedField(field);
                          setOpenFieldModal(true);
                        }}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </>
          </TableBody>
        </Table>
      </Paper>

      <Paper
        className={classes.mainPaper}
        variant="outlined"
        style={{ marginBottom: "5em" }}
      >
        <Typography variant="h6">Opcionais</Typography>
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">Nome</StyledTableCell>
              <StyledTableCell align="center">Descrição</StyledTableCell>
              <StyledTableCell align="center"></StyledTableCell>
              {/* <StyledTableCell align="center">
                Configuração
              </StyledTableCell> */}
              <StyledTableCell align="center">Opções</StyledTableCell>
              <StyledTableCell align="center">Contexto</StyledTableCell>
							<StyledTableCell align="center">Ordem</StyledTableCell>
              <StyledTableCell align="center">Ações</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {fields
                ?.filter(
                  (field) =>
                    field.type === "singleOption" ||
                    field.type === "multiOption"
                )
                ?.map((field) => (
                  <StyledTableRow key={field.id}>
                    <StyledTableCell align="center">
                      {field.name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.description}
                    </StyledTableCell>
                    <StyledTableCell align="center">{""}</StyledTableCell>
                    {/* <StyledTableCell align="center">{field.config}</StyledTableCell> */}
                    <StyledTableCell align="center">
                      {field?.options?.map((option, index) => {
                        if (index === 5) {
                          return (
                            <span
                              style={{
                                textAlign: "center",
                              }}
                            >
                              ...
                            </span>
                          );
                        }
                        if (index > 5) {
                          return;
                        }
                        return (
                          <Chip
                            key={option.id}
                            label={option.value}
                            variant="outlined"
                            size="small"
                            style={{
                              padding: 0,
                              margin: "0.3em",
                              fontSize: "0.8em",
                            }}
                          />
                        );
                      })}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {translateContext(field.context)}
                    </StyledTableCell>

										<StyledTableCell align="center">
											{field.order || 1}
										</StyledTableCell>

                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedField(field);
                          setOpenFieldModal(true);
                        }}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </>
          </TableBody>
        </Table>
      </Paper>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        style={{ marginBottom: "5em" }}
      >
        <Typography variant="h6">Mídias</Typography>
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">Nome</StyledTableCell>
              <StyledTableCell align="center">Descrição</StyledTableCell>
              <StyledTableCell align="center"></StyledTableCell>
              <StyledTableCell align="center">Contexto</StyledTableCell>
							<StyledTableCell align="center">Ordem</StyledTableCell>
              <StyledTableCell align="center">Ações</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {fields
                ?.filter((field) => field.type === "media")
                ?.map((field) => (
                  <StyledTableRow key={field.id}>
                    <StyledTableCell align="center">
                      {field.name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {field.description}
                    </StyledTableCell>
                    <StyledTableCell align="center">{""}</StyledTableCell>
                    <StyledTableCell align="center">
                      {translateContext(field.context)}
                    </StyledTableCell>
                    {/* <StyledTableCell align="center">{field.config}</StyledTableCell> */}

										<StyledTableCell align="center">
											{field.order || 1}
										</StyledTableCell>

                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedField(field);
                          setOpenFieldModal(true);
                        }}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Extrainfos;
