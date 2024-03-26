const getActionKey = (keyFromDB) => {
  const actions = [
    "update (pending -> open)",
    "update (open -> pending)",
    "update (closed -> open)",
    "update (open -> closed)",
    "create",
    "delete",
    "update (pending -> pending)",
    "mass closing",
    "preview",
  ];
  const keys = [
    "pendingOpen",
    "openPending",
    "closedOpen",
    "closed",
    "create",
    "delete",
    "transfer",
    "massClosing",
    "preview",
  ];

  const keyIndex = actions.findIndex((action) => keyFromDB === action);

  const key = keys[keyIndex];
  return key;
};

const getTicketActionMessage = (userAction) => {
  const key = getActionKey(userAction.action);

  const actionMessage = {
    pendingOpen: "Ticket obtido por",
    openPending: "Ticket devolvido por",
    closedOpen: "Ticket reaberto por",
    closed: "Ticket fechado por",
    create: "Ticket criado por",
    delete: "Ticket deletado por",
    preview: `Ticket visualizado por`,
  };

  if (key === "massClosing") {
    return `Tickets fechados em massa por ${userAction.fromUser}`;
  }

  if (key === "transfer") {
    return `Ticket transferido via RAMAL para ${userAction.toUser}`;
  }

  if (key === "pendingOpen" || userAction.action === "update (open -> open)") {
    return `Ticket obtido por ${userAction.toUser}`;
  }
  if (!userAction.toUser && key === "openPending") {
    return `${actionMessage[key]} ${userAction.fromUser || "Sistema"}`;
  }
  if (key === "closedOpen" && userAction.fromUser) {
    return `${actionMessage[key]} ${userAction.fromUser}`;
  }
  if (key === "closed" && userAction.fromUser) {
    return `${actionMessage[key]} ${userAction.fromUser || "Sistema"}`;
  }
  if (
    userAction.action.includes("update") &&
    userAction.fromUser &&
    userAction.toUser &&
    userAction.fromUser !== userAction.toUser
  ) {
    return `Transferido de ${userAction.fromUser} para ${userAction.toUser}`;
  }
  if (key === "create") {
    return userAction.fromUser
      ? `${actionMessage[key]} ${userAction.fromUser}`
      : `Ticket criado pelo(a) cliente ${userAction.contact.name}`;
  }
  if (key === "delete") {
    return `${actionMessage[key]} ${userAction.fromUser}`;
  }
  if (key === "preview") {
    return `${actionMessage[key]} ${userAction.fromUser}`;
  }
  return null;
};

export default getTicketActionMessage;
