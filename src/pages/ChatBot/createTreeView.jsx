import React, { useCallback, useEffect, useRef, useState } from "react";
import { TreeView, TreeItem } from "@material-ui/lab";
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Edit, Delete, Add } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Tooltip } from "@material-ui/core";
import api from "../../services/api";
import OptionModal from "../../components/OptionModal";

const useStyles = makeStyles({
  root: {
    height: "100%",
    flexGrow: 1,
    maxWidth: "100%",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f7f7f7",
    margin: "7px 0",
    borderTop: "1px solid #e0e0e0",
    borderBottom: "1px solid #e0e0e0",
    padding: "5px 10px",
  },
  listItemSecondaryAction: {
    display: "flex",
    justifyContent: "flex-end",
  },
  icon: {
    fontSize: "1rem",
    color: "#333",
  },
  treeItem: {
    background: "#cecece",
  },
  title: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: 14,
    overflowWrap: "anywhere",
    maxWidth: "400px",
  },
});

const DataTreeView = ({
  openOptionModal,
  botId,
  deleteOption,
  getChatBots,
}) => {
  const classes = useStyles();
  const [list, setList] = useState([]);
  const treeViewRef = useRef(null);
  const [editModal, setEditModal] = useState(false);
  const [option, setOption] = useState();

  const getOptions = useCallback(async () => {
    try {
      const { data } = await api.get(`option/${botId}`);
      setList(data);
    } catch (e) {
      console.log(e);
    }
  }, [botId]);

  useEffect(() => {
    getOptions();
  }, [getChatBots, getOptions]);

  const handleCloseEditModal = () => {
    setEditModal(false);
  };

  const handleOpenEditModal = (option) => {
    setOption(option);
    setEditModal(true);
  };

  const renderTreeItems = (items) =>
    items.map((item) => (
      <div key={item.id}>
        <Tooltip
          title={`${item["queue.name"] || "Sem setor"} | ${
            item?.action || "Sem Ação"
          }`}
        >
          <ListItem
            className={classes.listItem}
            style={{
              background: `${
                item["queue.color"] ? item["queue.color"] + "30" : "#f7f7f7"
              }`,
            }}
          >
            <div className={classes.listItemContent}>
              <Typography className={classes.title} gutterBottom>
                Opção
              </Typography>
              <Typography
                variant="body2"
                component="p"
                className={classes.bodyText}
              >
                {item?.name}
              </Typography>
              <Typography className={classes.title}>Cabeçalho</Typography>
              <Typography
                variant="body2"
                component="p"
                className={classes.bodyText}
              >
                {item.headerMessage}
              </Typography>
              <Typography className={classes.title}>Corpo</Typography>
              <Typography
                variant="body2"
                component="p"
                className={classes.bodyText}
              >
                {item.body}
              </Typography>
              <Typography className={classes.title}>Rodapé</Typography>
              <Typography
                variant="body2"
                component="p"
                className={classes.bodyText}
              >
                {item.footerMessage}
              </Typography>
              <ListItemSecondaryAction
                className={classes.listItemSecondaryAction}
              >
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpenEditModal(item)}
                >
                  <Edit className={classes.icon} />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteOption(item.id)}
                >
                  <Delete className={classes.icon} />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="add"
                  onClick={() => openOptionModal(botId, item.id)}
                >
                  <Add className={classes.icon} />
                </IconButton>
              </ListItemSecondaryAction>
            </div>
          </ListItem>
        </Tooltip>
        {item.children && (
          <TreeItem
            id={`cardNode${item.id}`}
            nodeId={String(item.id)}
            label="Níveis"
            children={renderTreeItems(item.children)}
            className={classes.treeItem}
          />
        )}
      </div>
    ));

  return (
    <div ref={treeViewRef}>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <List disablePadding>{renderTreeItems(list)}</List>
      </TreeView>
      <OptionModal
        modalOpen={editModal}
        onClose={handleCloseEditModal}
        option={option}
        getChatBots={getOptions}
      />
    </div>
  );
};

export default DataTreeView;
