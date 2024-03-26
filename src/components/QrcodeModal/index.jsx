import React, { useContext, useEffect, useState } from "react";
import QRCode from "qrcode.react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const QrcodeModal = ({ open, onClose, whatsAppId, isQrCode }) => {
  const [qrCode, setQrCode] = useState("");
  const { user } = useContext(AuthContext);
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [requestedPairCode, setRequestedPairCode] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [isValidNumber, setIsValidNumber] = useState(true);

  const requestPairCode = async () => {
    const cleanedNumber = number.replace(/\D/g, "");
    if (!whatsAppId || !cleanedNumber || !isValidNumber) return;

    try {
      const { data } = await api.post(
        `/whatsappsession-pairing/${whatsAppId}`,
        {
          number: cleanedNumber,
        }
      );
      setRequestedPairCode(true);
      setLoadingCode(true);
      toast.info(data.message);
    } catch (err) {
      toastError(err);
    }
  };

  const validatePhoneNumber = (inputNumber) => {
    const cleanedNumber = inputNumber.replace(/\D/g, "");

    if (/^\d{5,15}$/.test(cleanedNumber)) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (open) {
      setCode("");
      setNumber("");
      setRequestedPairCode(false);
      setIsValidNumber(true);
      const fetchSession = async () => {
        if (!whatsAppId) return;

        try {
          const { data } = await api.get(`/whatsapp/${whatsAppId}`);
          setQrCode(data.qrcode);
        } catch (err) {
          toastError(err);
        }
      };
      fetchSession();
    }
  }, [whatsAppId, open]);

  useEffect(() => {
    if (!whatsAppId) return;
    const socket = openSocket({
      scope: "qrcodeModal",
      userId: user.id,
      component: "QrcodeModal",
    });

    socket.on(`${user?.companyId}-whatsappSession`, (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }

      if (
        data.action === "pair-code" &&
        String(data.message.whatsappId) === String(whatsAppId)
      ) {
        setCode(data.message.code);
        setLoadingCode(false);
        toast.info(data.message.message);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose]);

  const handleNumberChange = (e) => {
    const inputNumber = e.target.value;
    setNumber(inputNumber);
    setIsValidNumber(validatePhoneNumber(inputNumber));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent>
        <Grid
          direction="column"
          justifyContent="center"
          alignItems="center"
          style={{
            minWidth: "300px",
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isQrCode && (
            <Grid item style={{ marginTop: "10px" }}>
              <Paper elevation={0}>
                <Typography color="primary" variant="h6" gutterBottom>
                  {i18n.t("qrCode.message")}
                </Typography>
                {qrCode ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <QRCode value={qrCode} size={256} />
                  </div>
                ) : (
                  <span>Waiting for QR Code</span>
                )}
              </Paper>
            </Grid>
          )}
          {!requestedPairCode && !isQrCode && (
            <Grid item style={{ marginTop: "10px", width: "100%" }}>
              <TextField
                label="Número de celular"
                fullWidth
                value={number}
                onChange={handleNumberChange}
                error={!isValidNumber}
                helperText={!isValidNumber ? "Número inválido" : ""}
              />
            </Grid>
          )}
          {!requestedPairCode && !isQrCode && (
            <Grid item style={{ marginTop: "10px", width: "100%" }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => requestPairCode()}
                disabled={
                  requestedPairCode || number.length < 1 || !isValidNumber
                }
              >
                Enviar
              </Button>
            </Grid>
          )}
          {requestedPairCode && !isQrCode && (
            <Grid
              item
              style={{
                marginTop: "10px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loadingCode && <CircularProgress color="inherit" size={50} />}
              <Typography variant="h3" color="secondary" gutterBottom>
                {code}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
