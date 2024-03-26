const targetTypes = {
  queue: "Setor",
  user: "Usuário",
  contact: "Contato",
  settings: "Configurações",
  connection: "Conexão",
  comment: "Anotação",
  disparar: "Disparador",
  notice: "Aviso",
  chatbot_auto_finish: "Recurso de finalização automática no ChatBot"
};

const message = {
  create: "criado por",
  update: "atualizado por",
  delete: "deletado por",
  enable: "habilitado por",
  disable: "desabilitado por",
};

const feminineMessage = {
  create: "criada por",
  update: "atualizada por",
  delete: "deletada por",
};

const getGeneralActionMessage = (userAction) => {
  const targetKey = userAction.targetType;
  const messageKey = userAction.action;

  if (targetKey === "settings") {
    return `Configurações alteradas por ${userAction.fromUser}`;
  }

  if (targetKey === "connection" || targetKey === "comment") {
    return `${targetTypes[targetKey]} ${feminineMessage[messageKey]} ${userAction.fromUser}`;
  }

  if (targetKey === "user") {
    if (messageKey.includes("online => offline")) {
      return `Usuário ${userAction.fromUser} saiu do sistema`;
    }
    if (messageKey.includes("offline => online")) {
      return `Usuário ${userAction.fromUser} entrou no sistema`;
    }
  }

	if (messageKey.includes('O usuário') && targetKey === 'contact') {
		return messageKey;
	}

  return `${targetTypes[targetKey]} ${message[messageKey]} ${userAction.fromUser}`;
};

export default getGeneralActionMessage;
