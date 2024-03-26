import api from "../../../services/api";
import toastError from "../../../errors/toastError";
import replaceSpecialChars from "./specialCharReplacer";

const getWildCardsFromTicket = async (ticketId) => {
  try {
    const { data } = await api.get(`/tickets/${ticketId}`);

    const wildCardsFromTicket = {
      protocolo: ticketId,
      atendente: data.user?.name,
      setor: data.queue?.name,
      cliente: data.contact?.name,
    };

    const extraInfo = data.contact.extraInfo;
    let wildCardsFromExtraInfo = {};

    if (extraInfo.length) {
      wildCardsFromExtraInfo = extraInfo.reduce((acc, { name, value }) => {
        acc = { ...acc, [replaceSpecialChars(name)]: value };
        return acc;
      }, {});
    }

    return { ...wildCardsFromTicket, ...wildCardsFromExtraInfo };
  } catch (err) {
    console.log(err);
    toastError(err);
  }
};

export default getWildCardsFromTicket;
