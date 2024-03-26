import getContactByNumber from "./getContactByNumber";

const checkContactExists = async (contactData) => {
  const { name, number } = contactData;

  const contact = await getContactByNumber(name, number);
  return contact;
};

export default checkContactExists;
