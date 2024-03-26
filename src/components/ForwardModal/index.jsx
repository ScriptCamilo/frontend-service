import React, { useContext, useEffect, useState } from "react";

import {
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  Select,
} from "@material-ui/core";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import SearchBar from "../SearchBar";

const ForwardModal = ({ open, onClose, message }) => {
  const [selectedWhats, setSelectedWhats] = useState("");
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState();
  const [page, setPage] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const { user } = useContext(AuthContext);

  const clearStates = () => {
    setContacts([]);
    setSearchQuery("");
    setHasMore(null);
    setPage(null);
    setLoading(false);
    setSelectedContacts([]);
    setSelectedWhats();
  };

  useEffect(() => {
    !open && clearStates();
  }, [open]);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const { data } = await api.get("/contacts-whatsapp/");
        setContacts(data.contacts);
        setHasMore(data.hasMore);
        setPage(2);
      } catch {
        console.log("Erro ao pegar chats");
      }
    };
    open && getContacts();
    setSearchQuery("");
    setSelectedWhats(message?.ticket.whatsappId);
  }, [open]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.get(
        `/contacts-whatsapp/?searchParam=${searchQuery}`
      );
      setContacts(data.contacts);
      setHasMore(data.hasMore);
      setPage(2);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMoreContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/contacts-whatsapp/${
          searchQuery && `?searchParam=${searchQuery}`
        }?pageNumber=${page}`
      );
      setContacts((prevContacts) => [...prevContacts, ...data.contacts]);
      setHasMore(data.hasMore);
      setPage((prevState) => prevState + 1);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleScroll = async (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollTopMax } = e.target;

    if (scrollTop === scrollTopMax) {
      loadMoreContacts();
    }
  };

  const handleToggleContact = (contactId) => {
    setSelectedContacts((prevSelectedContacts) => {
      if (prevSelectedContacts.includes(contactId)) {
        return prevSelectedContacts.filter((id) => id !== contactId);
      } else {
        return [...prevSelectedContacts, contactId];
      }
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      const allContactIds = contacts.map((contact) => contact.id);
      setSelectedContacts(allContactIds);
    }
  };

  const handleForwardMessage = async () => {
    setLoading(true);
    try {
      await api.post(`/messages-forward`, {
        messageId: message.id,
        contactIds: selectedContacts,
        whatsappId: selectedWhats,
      });
      toast.success("Mensagens enviadas");
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          backgroundColor: "#fff",
          padding: "20px",
          outline: "none",
        }}
      >
        <SearchBar
          handleSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          headerName={"Compartilhar mensagem"}
          searchName={"Buscar contatos"}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleToggleSelectAll}
        >
          {selectedContacts.length === contacts.length
            ? "Desmarcar Todos"
            : "Selecionar Todos"}
        </Button>
        <List
          onScroll={handleScroll}
          style={{ height: "50vh", overflow: "auto" }}
        >
          {contacts.map((contact) => (
            <ListItem key={contact.id}>
              <Checkbox
                checked={selectedContacts.includes(contact.id)}
                onChange={() => handleToggleContact(contact.id)}
              />
              <ListItemText primary={contact.name} />
            </ListItem>
          ))}
        </List>
        <Select
          fullWidth
          displayEmpty
          variant="outlined"
          value={selectedWhats}
          onChange={(e) => {
            setSelectedWhats(e.target.value);
          }}
          renderValue={() => {
            if (selectedWhats) {
              const whats =
                user && user.whatsapps.find((w) => w.id === selectedWhats);
              return whats?.name;
            } else {
              return "Selecione um Whatsapp";
            }
          }}
        >
          {user &&
            user.whatsapps.map((whats, key) => (
              <MenuItem dense key={key} value={whats.id}>
                <ListItemText primary={whats.name} />
              </MenuItem>
            ))}
        </Select>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button variant="contained" color="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button
            disabled={
              selectedContacts.length === 0 || !selectedWhats || loading
            }
            variant="contained"
            color="primary"
            onClick={() => handleForwardMessage()}
          >
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ForwardModal;
