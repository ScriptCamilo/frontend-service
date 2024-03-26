import React, { useEffect, useState, useContext } from "react";

import {
  Button,
  Divider,
  makeStyles,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
} from "@material-ui/core";

import OptionModal from "../../components/OptionModal";
import api from "../../services/api";
import BotModal from "../../components/BotModal";
import BotDrawer from "./botDrawer";
import Title from "../../components/Title";
import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: 16,
    color: "black",
  },
  bodyText: {
    fontSize: 14,
    color: "#171515",
    overflowWrap: "anywhere",
  },
}));

const ChatBot = () => {
  const classes = useStyles();
  const [chatBots, setChatBots] = useState([]);
  const [botId, setBotId] = useState(null);
  const [optionId, setOptionId] = useState(null);
  const [optionParentId, setOptionParentId] = useState(null);
  const [optionModal, setOptionModal] = useState(false);
  const [botModal, setBotModal] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeleteOptionConfirm, setOpenDeleteOptionConfirm] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    getChatBots();
  }, []);

  const getChatBots = () => {
    api.get("/chatbot").then((res) => {
      setChatBots(res.data);
    });
  };

  const handleCloseOptionModal = () => {
    setOptionModal(false);
  };

  const handleCloseBotModal = () => {
    setBotModal(false);
  };

  const handleOpenBotModal = () => {
    setBotModal(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setOpenDeleteConfirm(false);
  };

  const handleOpenConfirmDeleteModal = (id) => {
    setBotId(id);
    setOpenDeleteConfirm(true);
  };

  const handleCloseOptionConfirmDeleteModal = () => {
    setOpenDeleteOptionConfirm(false);
  };

  const handleOpenOptionConfirmDeleteModal = (id) => {
    setOptionId(id);
    setOpenDeleteOptionConfirm(true);
  };

  const openOptionModal = (id, parentId = null) => {
    setOptionParentId(null);
    setBotId(null);
    setOptionModal(true);
    if (id) setBotId(id);
    if (parentId) setOptionParentId(parentId);
  };

  const deleteOption = async () => {
    await api.delete(`/option/${optionId}`);
    api.get("/chatbot").then((res) => {
      setChatBots(res.data);
    });
  };

  const deleteBot = async () => {
    await api.delete(`/chatbot/${botId}`);
    const newList = chatBots.filter((bot) => bot.id !== botId);
    setChatBots(newList);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Chat Bot</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleOpenBotModal();
            }}
          >
            Adicionar Bot
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <TableContainer component={Paper}>
        <Table aria-label="Chatbot table" size="medium">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="left">Nome do Chatbot</StyledTableCell>
              <StyledTableCell align="left">
                Mensagem de Boas-vindas
              </StyledTableCell>
              <StyledTableCell align="left">
                Mensagem de Finalização de Atendimento
              </StyledTableCell>
              <StyledTableCell align="left">Ações</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {chatBots.map((bot, i) => (
              <StyledTableRow key={i}>
                <StyledTableCell align="left">
                  <Typography className={classes.title} gutterBottom>
                    {bot.name}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <Typography
                    variant="body2"
                    component="p"
                    className={classes.bodyText}
                  >
                    {bot.welcomeMessage}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="left">
                  <Typography
                    variant="body2"
                    component="p"
                    className={classes.bodyText}
                  >
                    {bot.endMessage}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="left">
                  {user.profile === "admin" && (
                    <BotDrawer
                      bot={bot}
                      openOptionModal={openOptionModal}
                      deleteOption={handleOpenOptionConfirmDeleteModal}
                      deleteBot={handleOpenConfirmDeleteModal}
                      getChatBots={getChatBots}
                    />
                  )}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <Divider />
        <OptionModal
          modalOpen={optionModal}
          onClose={handleCloseOptionModal}
          chatBotId={botId}
          parentId={optionParentId}
          getChatBots={getChatBots}
        />
        <BotModal
          modalOpen={botModal}
          onClose={handleCloseBotModal}
          getChatBots={getChatBots}
        />
        <ConfirmationModal
          title={"Confirmar deleção de bot"}
          children={"Esta ação não pode ser desfeita"}
          open={openDeleteConfirm}
          onClose={handleCloseConfirmDeleteModal}
          onConfirm={deleteBot}
        />
        <ConfirmationModal
          title={"Confirmar deleção de node"}
          children={"Esta ação não pode ser desfeita"}
          open={openDeleteOptionConfirm}
          onClose={handleCloseOptionConfirmDeleteModal}
          onConfirm={deleteOption}
        />
      </TableContainer>
    </MainContainer>
  );
};

export default ChatBot;
