const rules = {
  user: {
    static: [],
  },
  supervisor: {
    static: [
      "drawer-admin-items:supervisor",
    ],
  },
  admin: {
    static: [
			"drawer-admin-items:supervisor",
      "drawer-admin-items:view",
      "tickets-manager:showall",
      "user-modal:editProfile",
      "user-modal:editQueues",
      "ticket-options:deleteTicket",
      "ticket-options:transferWhatsapp",
      "contacts-page:deleteContact",
    ],
  },
};

export default rules;
