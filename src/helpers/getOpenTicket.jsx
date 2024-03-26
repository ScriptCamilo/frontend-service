import toastError from "../errors/toastError";
import api from "../services/api";

const getOpenTicket = async (metaId, contactId, whatsId, userId, whatsApiId) => {
  if (whatsId || metaId || whatsApiId) {
    const wId = whatsId || null
    const mId = metaId || null
		const wApiId = whatsApiId || null
    try {
      const { data: ticket } = await api.get(`/tickets/contact/${contactId}/whats/${wId}/user/${userId}/meta/${mId}/whatsApi/${wApiId}`);
      return ticket;    
    } catch (err) {
      toastError(err);    
    }
  }
};

export default getOpenTicket;
