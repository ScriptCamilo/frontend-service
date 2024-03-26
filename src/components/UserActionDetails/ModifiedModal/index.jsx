import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import api from "../../../services/api";
import toastError from "../../../errors/toastError";
import {
  IconButton,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import getFormattedTimestamp from "../../../helpers/getFormattedTimestamp";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import FacebookIcon from "@material-ui/icons/Facebook";
import InstagramIcon from "@material-ui/icons/Instagram";
import { useHistory } from "react-router-dom";
import { StyledTableCell, StyledTableRow } from "../../../pages/StyledTable";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
}));

const ModifiedModal = ({ actionId, open, handleClose }) => {
  const classes = useStyles();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/mass-user-actions/${actionId}`, {
          params: { pageNumber },
        });
        setActions((prevState) => [...prevState, ...data.massActions]);
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toastError(error);
      }
    })();
  }, [pageNumber]);

  const goToTicket = (ticketId) => {
    history.push(`tickets/${ticketId}`);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">Tickets finalizados</DialogTitle>
        <TableContainer
          style={{ height: "57vh", overflow: "scroll" }}
          onScroll={handleScroll}
        >
          <Table stickyHeader>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Contato</StyledTableCell>
                <StyledTableCell>Número</StyledTableCell>
                <StyledTableCell>Atendente</StyledTableCell>
                <StyledTableCell>Data de criação</StyledTableCell>
                {/* <StyledTableCell>Canal</StyledTableCell> */}
                <StyledTableCell>Acessar</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {actions?.map((action) => (
                <StyledTableRow key={action?.ticket?.id}>
                  <StyledTableCell>{action?.ticket?.id}</StyledTableCell>
                  <StyledTableCell>
                    {action?.ticket?.contact?.name}
                  </StyledTableCell>
                  <StyledTableCell>
                    {action?.ticket?.contact?.number}
                  </StyledTableCell>
                  <StyledTableCell>
                    {action?.ticket?.user?.name}
                  </StyledTableCell>
                  <StyledTableCell>
                    {getFormattedTimestamp(action?.ticket.createdAt).date}
                  </StyledTableCell>
                  {/* <StyledTableCell>{action?.ticket?.contact?.channel}</StyledTableCell> */}
                  <StyledTableCell>
                    <IconButton
                      size="small"
                      onClick={() => goToTicket(action?.ticket?.id)}
                    >
                      {(!action?.ticket?.contact?.channel ||
                        action?.ticket?.contact?.channel === "whatsapp") && (
                        <WhatsAppIcon />
                      )}
                      {action?.ticket?.contact?.channel === "facebook" && (
                        <FacebookIcon />
                      )}
                      {action?.ticket?.contact?.channel === "instagram" && (
                        <InstagramIcon />
                      )}
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Dialog>
    </div>
  );
};

export default ModifiedModal;
