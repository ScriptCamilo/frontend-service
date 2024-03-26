import getGeneralActionMessage from "./getActionMessage/getGeneralActionMessage";
import getTicketActionMessage from "./getActionMessage/getTicketActionMessage";

const getActionMessage = (userAction) => {
  if (userAction.targetType === "ticket") {
    return getTicketActionMessage(userAction);
  } else {
    return getGeneralActionMessage(userAction);
  }
};

export default getActionMessage;
