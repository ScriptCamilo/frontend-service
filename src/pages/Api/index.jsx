import React from "react";
import {
  Typography,
  Container,
  Grid,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getBackendUrlV1 } from "../../config";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    background: theme.palette.background.paper,
  },
  section: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    background: theme.palette.grey[100],
  },
  code: {
    backgroundColor: "black",
    color: "white",
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    display: "block",
    whiteSpace: "pre-wrap",
  },
}));

const DocumentationPage = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <div className={classes.paper}>
        <Typography variant="h4" gutterBottom>
          Documentação API Externa
        </Typography>

        <section className={classes.section}>
          <Typography variant="h5" gutterBottom>
            Introdução
          </Typography>
          <Typography paragraph>
            Bem-vindo à documentação da API de mensagens do nosso aplicativo.
            Esta documentação irá guiá-lo através do processo de envio de
            mensagens. Você precisará seguir alguns passos simples para se
            comunicar com nossa API de mensagens.
          </Typography>
        </section>

        <section className={classes.section}>
          <Typography variant="h5" gutterBottom>
            Pré-requisitos
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Acesso à nossa API de mensagens." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Conta de usuário com as permissões necessárias." />
            </ListItem>
          </List>
        </section>

        <section className={classes.section}>
          <Typography variant="h5" gutterBottom>
            Enviando Mensagens
          </Typography>

          <section className={classes.section}>
            <Typography variant="h6" gutterBottom>
              Endpoint
            </Typography>
            <Typography>
              - <strong>Método:</strong> POST
              <br />- <strong>URL:</strong> `{getBackendUrlV1()}
              /api/messages/send`
            </Typography>
          </section>

          <section className={classes.section}>
            <Typography variant="h6" gutterBottom>
              Parâmetros da Solicitação
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="`connectionId`: ID da conexão." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`queueId`: ID da fila (opcional)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`userId`: ID do usuário (opcional)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`body`: Corpo da mensagem." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`quotedMsgId`: ID da mensagem citada (opcional)." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`number`: Número de telefone/Id da meta('facebook', 'instagram', 'whatsappApi')." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`name`: Nome do contato da pessoa (Se tiver)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="`channel`: Canal de comunicação (por exemplo, 'whatsapp', 'facebook', 'instagram', 'whatsappApi')." />
              </ListItem>
              <ListItem>
                <ListItemText primary="`medias`: [suas-mídias (Buffer)] (opcional)." />
              </ListItem>
            </List>
          </section>

          <section className={classes.section}>
            <Typography variant="h6" gutterBottom>
              Exemplo de Solicitação
            </Typography>
            <Typography paragraph>
              Abaixo está um exemplo de como fazer uma solicitação para enviar
              uma mensagem:
            </Typography>
            <code className={classes.code}>
              {`fetch('${getBackendUrlV1()}/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer seu-token'
  },
  body: JSON.stringify({
    connectionId: 123,
    queueId: 456,
    userId: 789,
    body: 'Olá, esta é uma mensagem de teste.',
    quotedMsgId: 987,
    number: '1234567890',
    name: 'Pessoa 01',
    channel: 'whatsapp',
    medias: [suas-mídias (Buffer)]
  })
})
.then(response => response.json())
.then(data => {
  console.log(data);
})
.catch(error => {
  console.error(error);
});`}
            </code>
          </section>

          <section className={classes.section}>
            <Typography variant="h6" gutterBottom>
              Resposta
            </Typography>
            <Typography paragraph>
              - Se a mensagem for enviada com sucesso, você receberá uma
              resposta com o status 200 e um JSON contendo a mensagem de
              confirmação.
            </Typography>
            <code className={classes.code}>
              {`{
  "message": "Mensagem enviada com sucesso"
}`}
            </code>
          </section>
        </section>
      </div>
    </Container>
  );
};

export default DocumentationPage;
