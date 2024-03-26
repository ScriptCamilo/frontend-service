import toastError from "../errors/toastError";
import api from "../services/api";


const getContactByNumber = async (name, number) => {
  try {
    const { data } = await api.post("/contact", { name, number });
    return data;
  } catch (err) {
    toastError(err);
  }
};

export default getContactByNumber;
