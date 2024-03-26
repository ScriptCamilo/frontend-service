import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import IconButton from "@material-ui/core/IconButton";
import DataTreeView from "./createTreeView";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import EditBotModal from "../../components/BotModal/edit";
import MenuIcon from "@material-ui/icons/Menu";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ChatIcon from "@material-ui/icons/Chat";
import api from "../../services/api";
import { Tooltip } from "@material-ui/core";

const useStyles = makeStyles({
  containerStyle: {
    height: "auto",
  },
  maxWidth: {
    width: "20%",
  },
  icon: {
    fontSize: "1rem",
    color: "#333",
  },
});

export default function BotDrawer({
  bot,
  openOptionModal,
  deleteOption,
  deleteBot,
  getChatBots,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [state, setState] = React.useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    getChatBots();
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const cloneBot = async (id) => {
    await api.get(`/chatbot-clone/${id}`);
    getChatBots();
  };

  const list = () => (
    <div className={classes.containerStyle} role="presentation">
      <MainHeader>
        <Title>Árvore de Opções</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => openOptionModal(bot.id)}
          >
            Criar Nova Opção
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <List>
        {
          <DataTreeView
            openOptionModal={openOptionModal}
            botId={bot.id}
            deleteOption={deleteOption}
            getChatBots={getChatBots}
          />
        }
      </List>
    </div>
  );

  return (
    <div>
      {["left"].map((anchor) => (
        <React.Fragment key={anchor}>
          <Tooltip title="Mostrar opções">
            <IconButton
              aria-label="options"
              onClick={toggleDrawer(anchor, true)}
            >
              <MenuIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deletar Chatbot">
            <IconButton aria-label="delete" onClick={() => deleteBot(bot.id)}>
              <DeleteIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar Chatbot">
            <IconButton
              aria-label="edit"
              onClick={() => {
                setOpen(true);
              }}
            >
              <EditIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clonar Chatbot">
            <IconButton aria-label="clone" onClick={() => cloneBot(bot.id)}>
              <ChatIcon className={classes.icon} />
            </IconButton>
          </Tooltip>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            PaperProps={{ style: { width: "40%" } }}
          >
            {list(anchor)}
          </Drawer>
          <EditBotModal
            bot={bot}
            open={open}
            onClose={handleCloseModal}
            getChatBots={getChatBots}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
