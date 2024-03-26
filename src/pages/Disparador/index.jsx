import React, { useEffect, useState } from "react";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Tooltip,
} from "@material-ui/core";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import Stop from "@material-ui/icons/Stop";
import { toast } from "react-toastify";

import ConfirmationModal from "../../components/ConfirmationModal";
import DisparadorModal from "../../components/DisparadorModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { useAuthContext } from "../../context/Auth/AuthContext";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const Disparador = () => {
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openInvalidConfirm, setOpenInvalidConfirm] = useState(false);
  const [invalidContacts, setInvalidContacts] = useState([]);
  const [actualDisp, setActualDisp] = useState();
  const [disparadores, setDisparadores] = useState([]);
  const { track } = useAuthContext();

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleOpenConfirmModal = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirm(false);
  };

  const handleOpenConfirmDeleteModal = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setOpenDeleteConfirm(false);
  };

  const handleOpenConfirmInvalidModal = () => {
    setOpenInvalidConfirm(true);
  };

  const handleCloseConfirmInvalidModal = () => {
    setOpenInvalidConfirm(false);
  };

  const getDisparadores = () => {
    api.get("/disparador").then((res) => {
      setDisparadores(res.data);
    });
  };

  const dispararMensagem = () => {
    toast.info("Verificando contatos e disparando mensagens", {
      position: "top-right",
      hideProgressBar: false,
      pauseOnHover: false,
      closeOnClick: true,
      draggable: true,
      autoClose: false,
    });
    api
      .post(`/disparar/${actualDisp.id}`)
      .then((res) => {
        toast.success(res.data.message, {
          position: "top-right",
          hideProgressBar: false,
          pauseOnHover: false,
          closeOnClick: true,
          draggable: true,
          autoClose: false,
        });
        if (res.data.invalidContacts.length > 0) {
          setInvalidContacts(res.data.invalidContacts);
          handleOpenConfirmInvalidModal();
          getDisparadores();
        }
        if (new Date(actualDisp.date) > new Date()) {
          track("Trigger Change", {
            Action: "Scheduled",
            Contacts: actualDisp.contacts.split("\n").length,
          });
        } else {
          track("Trigger Change", {
            Action: "Fired on Time",
            Contacts: actualDisp.contacts.split("\n").length,
          });
        }
      })
      .catch((res) => {
        toast.error("Whatsapp não iniciado, tente novamente");
      });
  };

  const deleteDisparador = () => {
    try {
      api.delete(`/disparador/${actualDisp.id}`).then(() => {
        getDisparadores();
        toast.success("Disparador deletado com sucesso");
      });
    } catch {
      toast.error("Erro ao deletar Disparador");
    }
  };

  const stopDisparador = (disp) => {
    try {
      api.put(`/disparador/${disp.id}`, { ...disp, active: false }).then(() => {
        getDisparadores();
        toast.success("Disparador parado com sucesso");
      });
    } catch {
      toast.error("Erro ao parar Disparador");
    }
  };

  useEffect(() => {
    getDisparadores();
  }, []);

  return (
    <>
      <DisparadorModal
        disparador={actualDisp}
        open={open}
        onClose={handleCloseModal}
        getDisparadores={getDisparadores}
      />
      <ConfirmationModal
        title={"Confirmar disparo de mensagem"}
        children={"Esta ação não pode ser desfeita"}
        open={openConfirm}
        onClose={handleCloseConfirmModal}
        onConfirm={dispararMensagem}
      />
      <ConfirmationModal
        title={"Confirmar deleção de disparo"}
        children={"Esta ação não pode ser desfeita"}
        open={openDeleteConfirm}
        onClose={handleCloseConfirmDeleteModal}
        onConfirm={deleteDisparador}
      />
      <ConfirmationModal
        title={
          "Os seguintes números foram removidos pois não existem no whatsapp ou são inválidos"
        }
        children={invalidContacts.join("\n")}
        open={openInvalidConfirm}
        onClose={handleCloseConfirmInvalidModal}
        onConfirm={() => console.log("Ciente")}
      />
      <MainContainer>
        <MainHeader>
          <Title>Disparador</Title>
          <MainHeaderButtonsWrapper>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleOpenModal();
                setActualDisp(undefined);
              }}
            >
              Adicionar Disparador
            </Button>
          </MainHeaderButtonsWrapper>
        </MainHeader>
        <TableContainer component={Paper}>
          <Table size="medium">
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="left">Nome</StyledTableCell>
                <StyledTableCell align="left">Nº Contatos</StyledTableCell>
                <StyledTableCell align="left">Mensagem</StyledTableCell>
                <StyledTableCell align="left">Ações</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {disparadores.length > 0 &&
                disparadores.map((disp, i) => (
                  <StyledTableRow key={i}>
                    <StyledTableCell align="left">{disp.name}</StyledTableCell>
                    <StyledTableCell align="left">
                      {disp.contacts
                        ? disp.contacts.split("\n").length
                        : disp.contacts.length}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {disp.message}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Tooltip title="Disparar mensagem">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setActualDisp(disp);
                            handleOpenConfirmModal();
                          }}
                        >
                          <ArrowRightAltIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Parar disparador">
                        <IconButton
                          size="small"
                          onClick={() => {
                            stopDisparador(disp);
                          }}
                        >
                          <Stop />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar disparador">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setActualDisp(disp);
                            setOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deletar disparador">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setActualDisp(disp);
                            handleOpenConfirmDeleteModal();
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainContainer>
    </>
  );
};

export default Disparador;
