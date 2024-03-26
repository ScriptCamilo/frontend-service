import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Paper from "@material-ui/core/Paper";
import { useParams } from "react-router-dom";

import Ticket from "../../components/Ticket/";
import TicketsManager from "../../components/TicketsManager/";
import { useStyles } from "./styles";
import { useMediaQuery, useTheme } from "@material-ui/core";

const Chat = () => {
  const classes = useStyles();
  const { ticketId } = useParams();
	const [functionsDeleteTicketObject, setFunctionsDeleteTicketObject] = useState({
		open: () => {},
		close: () => {},
		pending: () => {},
		groups: () => {},
	});

	const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

	const heightParser = () => {
		if (isMobile && ticketId) {
			return '100%';
		} else if (isMobile && !ticketId) {
			return 'auto';
		} else {
			return '100%';
		}
	}

  return (
    <div className={classes.chatContainer}>
      <div className={classes.chatPapper}>
        <Grid container spacing={0}>
          {/* <Grid item xs={4} className={classes.contactsWrapper}> */}
          <Grid
            item
            xs={12}
            md={4}
            className={
              ticketId ? classes.contactsWrapperSmall : classes.contactsWrapper
            }
          >
            <TicketsManager setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject} />
          </Grid>
          <Grid 
						item 
						xs={12} 
						md={8} 
						className={classes.messagessWrapper}
						style={{
							height: heightParser()
						}}
					>
            {/* <Grid item xs={8} className={classes.messagessWrapper}> */}
            {ticketId ? (
              <>
                <Ticket functionsDeleteTicketObject={functionsDeleteTicketObject} />
              </>
            ) : (
              <Hidden only={["sm", "xs"]}>
                <Paper className={classes.welcomeMsg}>
                  {/* <Paper square variant="outlined" className={classes.welcomeMsg}> */}
                  {/* <span>{i18n.t("chat.noTicketMessage")}</span> */}
                  <img
                    className={classes.logo}
                    src="/desk_logo_simples.png"
                    alt="logo"
                  />
                </Paper>
              </Hidden>
            )}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Chat;
