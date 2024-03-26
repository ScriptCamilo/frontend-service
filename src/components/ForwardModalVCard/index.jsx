import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Select,
  MenuItem,
} from "@material-ui/core";
import SearchBar from "../SearchBar";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";

const ForwardModalVcard = ({ open, onClose, ticketId, whatsappId }) => {
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
    setSelectedWhats(whatsappId);
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

  const handleToggleContact = (contactNumber) => {
    setSelectedContacts((prevSelectedContacts) => {
      if (prevSelectedContacts.includes(contactNumber)) {
        return prevSelectedContacts.filter((id) => id !== contactNumber);
      } else {
        return [...prevSelectedContacts, contactNumber];
      }
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      const allContactIds = contacts.map((contact) => contact.number);
      setSelectedContacts(allContactIds);
    }
  };

  const handleForwardContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/messages-forward-vcard`, {
        ticketId: ticketId,
        contactsNumbers: selectedContacts,
        whatsappId: selectedWhats,
      });
      toast.success("Contatos enviados");
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
                checked={selectedContacts.includes(contact.number)}
                onChange={() => handleToggleContact(contact.number)}
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
            onClick={() => handleForwardContacts()}
          >
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ForwardModalVcard;
