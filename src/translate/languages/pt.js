const messages = {
  pt: {
    translations: {
      signup: {
        title: "Cadastre-se",
        toasts: {
          success: "Usuário criado com sucesso! Faça seu login!!!.",
          fail: "Erro ao criar usuário. Verifique os dados informados.",
        },
        form: {
          name: "Nome",
          email: "Email",
          password: "Senha",
        },
        buttons: {
          submit: "Cadastrar",
          login: "Já tem uma conta? Entre!",
        },
      },
      login: {
        title: "Login",
        form: {
          email: "Email",
          password: "Senha",
        },
        buttons: {
          submit: "Entrar",
          register: "Não tem um conta? Cadastre-se!",
        },
      },
      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Tickets hoje: ",
          },
        },
        messages: {
          inAttendance: {
            title: "Atendendo",
          },
          waiting: {
            title: "Aguardando",
          },
          closed: {
            title: "Finalizado",
          },
        },
      },
      connections: {
        title: "Conexões",
        toasts: {
          deleted: "Conexão com o WhatsApp excluída com sucesso!",
        },
        confirmationModal: {
          deleteTitle: "Deletar",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage:
            "Tem certeza? Você precisará ler o QR Code novamente.",
        },
        buttons: {
          add: "Adicionar WhatsApp",
          disconnect: "desconectar",
          tryAgain: "Tentar novamente",
          qrcode: "QR CODE",
          newQr: "Novo QR CODE",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "Falha ao iniciar sessão do WhatsApp",
            content:
              "Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code",
          },
          qrcode: {
            title: "Esperando leitura do QR Code",
            content:
              "Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão",
          },
          connected: {
            title: "Conexão estabelecida!",
          },
          timeout: {
            title: "A conexão com o celular foi perdida",
            content:
              "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code",
          },
        },
        table: {
          name: "Nome",
          status: "Status",
          lastUpdate: "Última atualização",
          default: "Padrão",
          actions: "Ações",
          session: "Sessão",
        },
      },
      whatsappModal: {
        title: {
          add: "Adicionar WhatsApp",
          edit: "Editar WhatsApp",
        },
        form: {
          name: "Nome",
          default: "Padrão",
          farewellMessage: "Mensagem de despedida",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "WhatsApp salvo com sucesso.",
      },
      qrCode: {
        message: "Leia o QrCode para iniciar a sessão",
      },
      contacts: {
        title: "Contatos",
        toasts: {
          deleted: "Contato excluído com sucesso!",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Deletar ",
          importTitlte: "Importar contatos",
					importTitleList: "Importar Lista de Contatos",
          deleteMessage:
            "Tem certeza que deseja deletar este contato? Todos os tickets relacionados serão perdidos.",
          importMessage: "Deseja importas todos os contatos do telefone?",
					importListMessage: "Deseja importar todos os contatos de uma lista?",
        },
        buttons: {
          import: "Importar Contatos",
					importlist: "Importar Contatos de Arquivo (CSV / XLS)",
          add: "Adicionar Contato",
        },
        table: {
          name: "Nome",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Ações",
        },
      },
      contactModal: {
        title: {
          add: "Adicionar contato",
          edit: "Editar contato",
        },
        form: {
          mainInfo: "Dados do contato",
          extraInfo: "Informações adicionais",
          name: "Nome",
          number: "Número do Whatsapp",
          email: "Email",
          extraName: "Nome do campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Adicionar informação",
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Contato salvo com sucesso.",
      },
      customerModal: {
        title: {
          add: "Adicionar novo cliente",
          edit: "Editar cliente",
        },
        form: {
          mainInfo: "Dados do cliente",
          name: "Nome",
          url: "URL",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        confirmDelete: "Você tem certeza que quer excluir esta empresa cliente?",
        toasts: {
          success: "Cliente salvo com sucesso.",
          deleted: "Cliente deletado com sucesso.",
        },
      },
      noticeModal: {
        title: {
          notice: "Criação de PopUp",
        },
        form: {
          title: "Título",
          message: "Mensagem",
          buttonText: "Texto do botão",
          url: "URL",
          type: "Tipo de aviso",
          customers: "Clientes",
        },
        buttons: {
          okNotify: "Notificar",
          cancel: "Cancelar",
        },
        toasts: {
          allSuccess: "Todos clientes foram notificados com sucesso.",
          someSuccess: "Alguns clientes foram notificados com sucesso.",
          deleted: "Notificação deletada com sucesso.",
          edited: "Notificação atualizada com sucesso."
        },
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir esta notificação?",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        severity: {
          error: "Erro",
          warning: "Alerta",
          info: "Informação",
          success: "Sucesso",
        },
      },
      quickAnswersModal: {
        title: {
          add: "Adicionar Mensagem Rápida",
          edit: "Editar Mensagem Rápida",
        },
        form: {
          shortcut: "Atalho",
          message: "Mensagem Rápida",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Mensagem Rápida salva com sucesso.",
      },
      scheduleModal: {
        title: {
          add: "Agendar uma mensagem",
          edit: "Editar mensagem agendada",
          copy: "Copiar mensagem agendada",
        },
        form: {
          message: "Mensagem",
        },
        buttons: {
          okAdd: "Agendar",
          okEdit: "Salvar",
          okCopy: "Copiar",
          cancel: "Cancelar",
        },
        success: "Mensagem agendada com sucesso.",
      },
      selectConnection: {
        whatsapp: {
          label: "Selecione um WhatsApp",
          firstItem: "Sem WhatsApp",
          empty: "Nenhum WhatsApp atribuído ao atendente"
        },
        facebook: {
          label: "Selecione um Facebook",
          firstItem: "Sem Facebook",
          empty: "Nenhum Facebook atribuído ao atendente"
        },
        instagram: {
          label: "Selecione um Instagram",
          firstItem: "Sem Instagram",
          empty: "Nenhum Instagram atribuído ao atendente"
        },
      },
      queueModal: {
        title: {
          add: "Adicionar setor",
          edit: "Editar setor",
          notification: {
            title: "Setor salvo com sucesso!",
          },
        },
        form: {
          name: "Nome",
          color: "Cor",
          greetingMessage: "Mensagem de saudação",
          absenceMessage: "Mensagem de ausência",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
      },
      userModal: {
        title: {
          add: "Adicionar usuário",
          edit: "Editar usuário",
        },
        form: {
          name: "Nome",
          email: "Email",
          password: "Senha",
          profile: "Perfil",
          whatsapp: "Conexão Padrão",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
          block: "Bloquear usuário",
          unblock: "Desbloquear usuário",
        },
        success: "Usuário salvo com sucesso.",
        block: "Usuário bloqueado com sucesso.",
        unblock: "Usuário desbloqueado com sucesso.",
      },
      chat: {
        noTicketMessage: "Selecione um ticket para começar a conversar.",
      },
      uploads: {
        titles: {
          titleUploadMsgDragDrop: "ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO",
          titleFileList: "Lista de arquivo(s)",
        },
      },
      ticketsManager: {
        buttons: {
          newTicket: "Novo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Setores",
      },
      tickets: {
        toasts: {
          deleted: "O ticket que você estava foi deletado.",
        },
        notification: {
          message: "Mensagem de",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
        },
        search: {
          placeholder: "Buscar tickets e mensagens",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Digite para buscar usuários",
        fieldQueueLabel: "Transferir para setor",
        fieldConnectionLabel: "Transferir para conexão",
        fieldQueuePlaceholder: "Selecione uma setor",
        fieldConnectionPlaceholder: "Selecione uma conexão",
        noOptions: "Nenhum usuário encontrado com esse nome",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Aguardando",
        assignedHeader: "Atendendo",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage:
          "Nenhum ticket encontrado com esse status ou termo pesquisado",
        connectionTitle: "Conexão que está sendo utilizada atualmente.",
        buttons: {
          accept: "Aceitar",
        },
      },
      newTicketModal: {
        title: "Criar Ticket",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexões",
          tickets: "Tickets",
          schedules: "Agendamentos",
          contacts: "Contatos",
          quickAnswers: "Mensagens Rápidas",
          queues: "Setores",
          administration: "Administração",
          users: "Usuários",
          settings: "Configurações",
          adminPanel: "Painel de admin",
          Disparo: "Disparo em Massa",
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Sair",
          },
        },
      },
      notifications: {
        noTickets: "Nenhuma notificação.",
      },
      queues: {
        title: "Setores",
        notifications: {
          queueDeleted: "O setor foi deletado.",
        },
        table: {
          name: "Nome",
          color: "Cor",
          greeting: "Mensagem de saudação",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar setor",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! Os tickets desse setor continuarão existindo, mas não terão mais nenhum setor atribuída.",
        },
      },
      queueSelect: {
        inputLabel: "Setores",
      },
      contactSelect: {
        inputLabel: "Contatos",
      },
      quickAnswersSelect: {
        inputLabel: "Usuários",
      },
      quickAnswers: {
        title: "Mensagens Rápidas",
        table: {
          shortcut: "Atalho",
          message: "Mensagem Rápida",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar Mensagem Rápida",
        },
        toasts: {
          deleted: "Mensagem Rápida excluída com sucesso.",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle:
            "Você tem certeza que quer excluir esta Mensagem Rápida: ",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
      },
      schedules: {
        title: "Agendamentos",
        table: {
          user: "Usuário",
          message: "Mensagem",
          date: "Data",
          status: "Status",
          actions: "Ações",
        },
        status: {
          scheduled: "Agendado",
          sent: "Enviado",
          error: "Não enviado",
        },
        date: {
          format: "DD/MM/YYYY HH:mm"
        },
        buttons: {
          add: "Salvar novo agendamento",
        },
        toasts: {
          deleted: "Mensagem agendada deletada com sucesso.",
          sendNow: "Mensagem agendada enviada com sucesso."
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Você tem certeza que quer excluir esta mensagem agendada?",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
      },
      users: {
        title: "Usuários",
        table: {
          name: "Nome",
          email: "Email",
          profile: "Perfil",
          whatsapp: "Setores",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar usuário",
          blockAll: "Bloquear todos os usuários",
          unblockAll: "Desbloquear todos os usuários",
        },
        toasts: {
          deleted: "Usuário excluído com sucesso.",
          blocked: "Usuários bloqueados com sucesso.",
          unblocked: "Usuários desbloqueados com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados do usuário serão perdidos. Os tickets abertos deste usuário serão movidos para o setor.",
        },
      },
      settings: {
        success: "Configurações salvas com sucesso.",
        title: "Configurações",
        settings: {
          userCreation: {
            name: "Criação de Usuário",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
            CheckMsgIsGroup: {
              name: "Mensagens de Grupos",
              options: {
                enabled: "Ativado", // não aceita mensagens de grupos
                disabled: "Desativado", // aceita mensagens de grupos
              },
            },
          },
          timeCreateNewTicket: {
            name: "Cria novo ticket após",
            note: "Selecione o tempo que será necessário para abrir um novo ticket, caso o cliente entre em contatos novamente",
            options: {
              10: "10 Segundos",
              30: "30 Segundos",
              60: "1 minuto",
              300: "5 minutos",
              1800: "30 minutos",
              3600: "1 hora",
              7200: "2 horas",
              21600: "6 horas",
              43200: "12 horas",
            },
          },
          call: {
            name: "Mensagem Automática para Ligações",
            note: "Se desabilitado, o cliente receberá uma mensagem informando que não aceita chamadas de voz/vídeo",
            options: {
              enabled: "Sim", // envia mensagem automática
              disabled: "Não", // não envia mensagem automática
            },
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Atribuído à:",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
          },
        },
        body: {
          buttons: {
            export: "Exportar",
          },
        },
      },
      messagesInput: {
        placeholderOpen:
          "Digite uma mensagem ou tecle ''/'' para utilizar as respostas rápidas cadastrada",
        placeholderClosed:
          "Reabra ou aceite esse ticket para enviar uma mensagem.",
        signMessage: "Assinar",
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informações",
      },
      copyToClipboard: {
        copy: "Copiar",
        copied: "Copiado",
      },
      ticketOptionsMenu: {
        delete: "Deletar",
        transfer: "Transferir",
        export: "Exportar",
        confirmationModal: {
          title: "Deletar o ticket do contato",
          message:
            "Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Deletar",
        reply: "Responder",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      exportModal: {
        title: "Exportar conversa",
        description: "Deseja exportar toda a conversa deste ticket?",
        buttons: {
          export: "Exportar",
          cancel: "Cancelar",
        },
      },
      backendErrors: {
        ERR_DUPLICATED_EXTRAINFO_OPTION: "Nome de opção já utilizado.",
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_NO_DEF_WAPP_FOUND:
          "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_CHECK_CONTACT:
          "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_INVALID_CREDENTIALS:
          "Erro de autenticação. Por favor, tente novamente.",
        ERR_APP_NOT_ENABLE: "Módulo de Aplicativo não incluso no plano. Por favor contacte o suporte",
        ERR_USER_INACTIVE: "Usuário bloqueado.",
        ERR_USER_NOT_FOUND: "Usuário não encontrado.",
        ERR_HOUR_NOT_ALLOWED: "Usuário não tem permissão para acessar esse horário.",
        ERR_SENDING_WAPP_MSG:
          "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Já existe um tíquete aberto para este contato.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED:
          "A criação do usuário foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhum tíquete encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar tíquete no banco de dados.",
        ERR_FETCH_WAPP_MSG:
          "Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Esta cor já está em uso, escolha outra.",
        ERR_WAPP_GREETING_REQUIRED:
          "A mensagem de saudação é obrigatório quando há mais de uma fila.",
				ERR_EMAIL_ALREADY_EXISTS: "Este email já está em uso.",
      },
    },
  },
};

export { messages };
