import React, { useEffect, useState, useContext } from "react";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableHead,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import TagModal from "../../components/TagModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
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

const Tags = () => {
  const classes = useStyles();

  const [tags, setTags] = useState();
  const [loading, setLoading] = useState(false);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tags");
        setTags(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  const handleOpenTagModal = () => {
    setTagModalOpen(true);
    setSelectedTag(null);
  };

  const handleCloseTagModal = () => {
    setTagModalOpen(false);
    setSelectedTag(null);
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tags");
        setTags(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedTag(null);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("queues.notifications.queueDeleted"));
    } catch (err) {
      toastError(err);
    }
    setSelectedTag(null);
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tags");
        setTags(data);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedTag &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${
            selectedTag.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteTag(selectedTag.id)}
      >
        {i18n.t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        tagId={selectedTag?.id}
      />
      <MainHeader>
        <Title>Etiquetas</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenTagModal}
          >
            Adicionar etiqueta
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">Nome</StyledTableCell>
              <StyledTableCell align="center">Cor</StyledTableCell>
              <StyledTableCell align="center">Ações</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {
              <>
                {tags?.map((tag) => (
                  <StyledTableRow key={tag.id}>
                    <StyledTableCell align="center">{tag.name}</StyledTableCell>
                    <StyledTableCell align="center">
                      <div className={classes.customStyledTableCell}>
                        <span
                          style={{
                            backgroundColor: tag.color,
                            width: 60,
                            height: 20,
                            alignSelf: "center",
                          }}
                        />
                      </div>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {user.profile === "admin" && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTag(tag)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTag(tag);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                {loading && <TableRowSkeleton columns={4} />}
              </>
            }
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Tags;
