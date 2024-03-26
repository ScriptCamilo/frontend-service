import React, { useCallback, useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import toastError from "../../errors/toastError";
import { CSVLink } from "react-csv";
import * as xlsx from "xlsx";

import api from "../../services/api";
import { CircularProgress, Typography } from "@material-ui/core";

const ExportContactsModal = ({ open, onClose, lastSanitizedFilters }) => {
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
      "created",
      "isGroup",
      "name",
      "number",
      "user",
    ];
    const translated = [
      "Id",
      "Criado em",
      "É Grupo",
      "Nome",
      "Número",
      "Atendente Recorrente",
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

  const generateCSVBody = (data) => {
    const csvBody = data.map((contact) => {
      const extraInfosObj = {};
      const tagsObj = {};

      if (contact.extraInfo.length > 0) {
        contact.extraInfo.forEach(({ name, value, option, field }) => {
          switch (field?.type) {
            case "singleOption":
              if (option) {
                extraInfosObj[name] = option.value;
              }
              break;
            case "multiOption":
              if (option) {
                if (extraInfosObj[name]) {
                  extraInfosObj[
                    name
                  ] = `${extraInfosObj[name]}, ${option.value}`;
                } else {
                  extraInfosObj[name] = [option.value];
                }
              }
              break;
            default:
              extraInfosObj[name] = value;
          }
        });
      }

      if (contact.tags.length > 0) {
        contact.tags.forEach(
          (tag, i) =>
            (tagsObj[`tag${(i + 1).toString().padStart(2, "0")}`] = tag?.name)
        );
      }

      const createdAt = new Date(contact.createdAt);

      return {
        id: contact.id,
        created: createdAt.toLocaleString(),
        isGroup: contact.isGroup === true ? "Sim" : "Não",
        name: contact?.name,
        number: contact.number,
        user: contact.user ? contact.user?.name : null,
        ...extraInfosObj,
        ...tagsObj,
      };
    });

    return csvBody;
  };

  const exportToXLSX = () => {
    const filename = generateFilename("xlsx");
    const workbook = xlsx.utils.book_new();
    const newCsvData = csvData.map((obj) => {
      const arrayOfObj = Object.entries(obj);
      const newObj = {};
      arrayOfObj.forEach(([key, value]) => {
        const headerExists =
          csvHeaders.find((header) => header.key === key) || {};
        newObj[headerExists.label || key] = value;
      });
      return newObj;
    });
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

    const filename = `contatos_deskrio_${date}_${time}.${name}`;
    return filename;
  };

  useEffect(() => {
    const getAllContacts = async () => {
      try {
        if (open) {
          const { data } = await api.post("/filtered-all-contacts", {
            extraFields: { ...lastSanitizedFilters },
          });

          setCsvHeaders(generateCSVHeaders(generateCSVBody(data)));
          setCsvData(generateCSVBody(data));
          setLoading(false);
        }
      } catch (err) {
        console.log({ err });
        toastError(err);
        setLoading(false);
      }
    };

    getAllContacts();
  }, [open, generateCSVHeaders, lastSanitizedFilters]);

  return (
    <Dialog
      style={{ textAlign: "center" }}
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        Tem certeza que quer exportar os contatos?
      </DialogTitle>
      {loading === true && <Typography>Carregando Contatos...</Typography>}
      <DialogActions>
        <Button variant="outlined" onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        {loading === true ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Button onClick={handleClose} color="primary" variant="contained">
              <CSVLink
                style={{ color: "white", textDecoration: "none" }}
                separator=";"
                filename={generateFilename("csv")}
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

export default ExportContactsModal;
