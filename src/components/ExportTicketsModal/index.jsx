import React, { useCallback, useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import toastError from "../../errors/toastError";
import { CSVLink } from "react-csv";
import * as xlsx from "xlsx";

import api from "../../services/api";
import {
  CircularProgress,
  Typography,
} from "@material-ui/core";

const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

const ExportTicketsModal = ({ open, onClose, lastSanitizedFilters }) => {
  const [loading, setLoading] = useState(true);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);

  const handleClose = () => {
    onClose();
    setLoading(true);
  };

  const checkDuplicates = (acc, curr) => {
    return acc.some(
      (accHeader) => JSON.stringify(accHeader) === JSON.stringify(curr)
    );
  };

  const generateCSVHeaders = useCallback((data) => {
    const defaultLabels = [
      "id",
      "origin",
      "status",
      "created",
      "updated",
      "contactName",
      "contactNumber",
      "user",
      "queueName",
      "connection",
      "option",
      "obs",
      "avaliation",
    ];
    const translated = [
      "Protocolo",
      "Origem",
      "status",
      "Criado em",
      "Fechado em",
      "Nome do contato",
      "Número do contato",
      "Atendente",
      "Setor",
      "Conexão",
      "Motivo",
      "Observação",
      "Avaliação",
    ];

    const headers = [];
    data.forEach((obj) => {
      Object.keys(obj).map((key, i) => {
        const label = `${key}`;
        const headerObj = { label, key };

        if (i < defaultLabels.length) {
          if (key === defaultLabels[i]) {
            headerObj.label = translated[i];
          } else {
            headerObj.label = label;
          }
        }

        const headerExists = checkDuplicates(headers, headerObj);
        if (headerExists === false) {
          headers.push(headerObj);
        }
        return null;
      });
    }, []);

    return headers;
  }, []);

  const defineOrigim = (ticket) => {
    if (!ticket?.action || ticket?.action.length === 0) {
      return "";
    }

    if (
      ticket.action &&
      ticket.action.find(
        (action) => action.fromUser === null || action.fromUser === "Chatbot"
      )
    ) {
      return "Potencial";
    } else {
      return ticket.origin || "Ativo";
    }
  };

  const defineStatus = (ticket) => {
    if (ticket.status === "open") {
      return "Aberto";
    }

    if (ticket.status === "closed") {
      return "Fechado";
    }

    if (ticket.status === "pending") {
      return "Pendente";
    }
  };

  const ticketClosedDate = (ticket) => {
    if (ticket.status === "closed") {
      return `${new Date(ticket.updatedAt).toLocaleDateString(
        "pt-BR",
        options
      )}`;
    }

    return "";
  };

  const generateCSVBody = useCallback((data) => {
    const csvBody = data.map((ticket) => {
      if (!ticket.option) {
        return {
          id: ticket.id,
          origin: ticket.origin || defineOrigim(ticket),
          status: defineStatus(ticket),
          created: new Date(ticket.createdAt).toLocaleDateString(
            "pt-BR",
            options
          ),
          updated: ticketClosedDate(ticket),
          contactName: ticket.contact?.name,
          contactNumber: ticket.contact?.number,
          user: ticket.user ? ticket.user?.name : null,
          queueName: ticket.queue?.name,
          connection: ticket.meta?.name || ticket.whatsapp?.name,
          option: ticket.endTicket[0]?.option,
          obs: ticket.endTicket[0]?.body,
          avaliation: ticket?.avaliation?.avaliation,
        };
      }
      return null;
    });

    return csvBody;
  }, []);

	const exportToXLSX = () => {
    const filename = generateFilename('xlsx');
    const workbook = xlsx.utils.book_new();
		const newCsvData = csvData.map((obj) => {
			const arrayOfObj = Object.entries(obj);
			const newObj = {};
			arrayOfObj.forEach(([key, value]) => {
				const headerExists = csvHeaders.find((header) => header.key === key) || {};
				newObj[headerExists.label || key] = value;
			});
			return newObj;
		})
    const worksheet = xlsx.utils.json_to_sheet(newCsvData, {
			// header: csvHeaders.map((header) => header.label),
		});
    xlsx.utils.book_append_sheet(workbook, worksheet, "Planilha1");
    xlsx.writeFile(workbook, filename);
  };

  const generateFilename = (name) => {
    const today = new Date();

    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const date = `${day}-${month}-${today.getFullYear()}`;

    const hours = today.getHours().toString().padStart(2, "0");
    const minutes = today.getMinutes().toString().padStart(2, "0");
    const seconds = today.getSeconds().toString().padStart(2, "0");
    const time = `${hours}-${minutes}-${seconds}`;

    const filename = `tickets_deskrio_${date}_${time}.${name}`;
    return filename;
  };

  useEffect(() => {
    const getAllTickets = async () => {
      try {
        if (open) {
          setLoading(true);
          const { data } = await api.post("/end-tickets-filters-all", {
						...lastSanitizedFilters
					});

          setCsvHeaders(generateCSVHeaders(generateCSVBody(data.tickets)));
          setCsvData(generateCSVBody(data.tickets));
          setLoading(false);
        }
      } catch (err) {
        console.log({ err });
        toastError(err);
        setLoading(false);
      }
    };

    getAllTickets();
  }, [open, generateCSVBody, generateCSVHeaders, lastSanitizedFilters]);

  return (
    <Dialog
      style={{ textAlign: "center" }}
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        Tem certeza que quer exportar todos os tickets?
      </DialogTitle>
      <Typography
        style={{
          fontStyle: "italic",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        {loading === true ? (
          "Carregando Tickets..."
        ) : (
          <>{`${csvData.length} tickets disponíveis`}</>
        )}
      </Typography>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} color="secondary">
          Cancelar
        </Button>
				{loading === true ? (
					<CircularProgress size={24} />
				) : (
					<>
						<Button
							variant="contained"
							onClick={handleClose}
							color="primary"
							disabled={loading}
						>
							<CSVLink
								style={{ textDecoration: "none", color: "inherit" }}
								separator=";"
								filename={() => generateFilename('csv')}
								headers={csvHeaders}
								data={csvData}
							>
								Baixar CSV
							</CSVLink>
						</Button>
	
						<Button
							onClick={() => {
								exportToXLSX();
								handleClose();
							}}
							color="primary"
							variant="contained"
						>
							Baixar XLSX
						</Button>
					</>
				)}
      </DialogActions>
    </Dialog>
  );
};

export default ExportTicketsModal;
