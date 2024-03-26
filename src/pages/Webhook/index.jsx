import React, { useEffect, useState } from "react";

// Material UI Imports
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

// Components Imports
import Title from "../../components/Title";
import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import WebhookModal from "../../components/WebhookModal";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const Webhook = () => {
  const [open, setOpen] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [actualWebhook, setActualWebhook] = useState();
  const [webhooks, setWebhooks] = useState([]);

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleOpenConfirmDeleteModal = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setOpenDeleteConfirm(false);
  };

  const getWebhooks = () => {
    api.get("/webhook").then((res) => {
      setWebhooks(res.data);
    });
  };

  const deleteWebhook = () => {
    try {
      api.delete(`/webhook/${actualWebhook.id}`).then(() => {
        getWebhooks();
        toast.success("Webhook deletado com sucesso");
      });
    } catch {
      toast.error("Erro ao deletar Webhook");
    }
  };

  useEffect(() => {
    getWebhooks();
  }, []);

  return (
    <>
      <WebhookModal
        webhook={actualWebhook}
        open={open}
        onClose={handleCloseModal}
        getWebhooks={getWebhooks}
      />
      <ConfirmationModal
        title={"Confirmar deleção de webhook"}
        children={"Esta ação não pode ser desfeita"}
        open={openDeleteConfirm}
        onClose={handleCloseConfirmDeleteModal}
        onConfirm={deleteWebhook}
      />
      <MainContainer>
        <MainHeader>
          <Title>WebHooks</Title>
          <MainHeaderButtonsWrapper>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleOpenModal();
                setActualWebhook(undefined);
              }}
            >
              Adicionar WebHook
            </Button>
          </MainHeaderButtonsWrapper>
        </MainHeader>
        <TableContainer component={Paper}>
          <Table size="medium">
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="left">Url</StyledTableCell>
                <StyledTableCell align="right">Active</StyledTableCell>
                <StyledTableCell align="right">Ações</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {webhooks.length > 0 &&
                webhooks.map((webhook, i) => (
                  <StyledTableRow key={i}>
                    <StyledTableCell align="left">
                      {webhook.url}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {webhook.active ? "Ativado" : "Desativado"}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setActualWebhook(webhook);
                          setOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setActualWebhook(webhook);
                          handleOpenConfirmDeleteModal();
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
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

export default Webhook;
