import React from "react";
import { Page, Text, View, Document, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { format, parseISO } from "date-fns";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    flewWrap: "wrap",
    margin: 10,
    zIndex: -2,
  },
  logo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.8,
    zIndex: -1,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 10,
    padding: 3,
  },
  section: {
    margin: 2,
    padding: 3,
    display: "flex",
    flexDirection: "row",
    flewWrap: "wrap",
  },
  text: {
    fontSize: 12,
    margin: "0 1cm",
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    margin: 10,
    padding: 3,
  },
});

Font.registerEmojiSource({
  format: "png",
  url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/",
});

const ExportMessagesPDF = ({ messages, from, ticket, users, allChatNumber }) => {
  const user = {};
  users.forEach((u) => {
    user[u.id] = u.name;
  });
  
 return (
  <Document title={`Messages from ${from}`} author="DeskRio" subject="Export Messages">
    <Page size="A4" style={styles.page} wrap>
      <Image style={styles.logo} src="/desk_logo_simples.png" fixed />
      <View style={styles.header} fixed>
        <Text style={{ textAlign: "center" }}>Deskrio</Text>
        <Text>
					{allChatNumber ? `Todas as conversas com ${from}` 
					: `Conversa com ${from}`}
				</Text>
        <Text>{allChatNumber ? "" : `Ticket ${ticket}`}</Text>
      </View>
      {messages.map((message, index) => {
        let content;
        if (message.isDeleted) content = "(excluído)";
        else if (message.mediaType === "chat") content = message.body;
        else content = `${message.mediaType}: ${message.mediaUrl}`;
        return (
          <View style={styles.section} key={index}>
            <Text style={styles.text}>
              {`[${format(parseISO(message.createdAt), "dd/MM/yyyy HH:mm:ss")}]  ${
                message.fromMe
                  ? `${user[message.userId] || 'Sistema'}:`
                  : `${message.contact?.name}:`
              }  ${content}`}
            </Text>
          </View>
        );
      })}
      <View style={styles.footer} fixed>
        <Text
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </View>
    </Page>
  </Document>
)};

export default ExportMessagesPDF;
