import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import {
  PhotoLibrary as PhotoLibraryIcon,
  ContactPhone as ContactPhoneIcon,
  AttachFile,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core";

import ForwardModalVCard from "../ForwardModalVCard";

const useStyles = makeStyles((theme) => ({
  menu: {
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  menuIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#42722c",
    color: "white",
  },
  largerIcon: {
    fontSize: "27px",
  },
  darkBackground: {
    backgroundColor: "dark",
  },
}));

const TicketShareMenu = ({ channel, ticketId, whatsappId, className, isMobile, isOficial }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openForwardModal, setOpenForwardModal] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenForwardModal = () => {
    setOpenForwardModal(true);
    handleClose();
  };

  const handleCloseForwardModal = (e) => {
    setOpenForwardModal(false);
    handleClose();
  };

  return (
    <div style={{ width: "100%" }}>
      <ForwardModalVCard
        open={openForwardModal}
        onClose={handleCloseForwardModal}
        ticketId={ticketId}
        whatsappId={whatsappId}
      />

			{!isMobile ? (
				<>
					<Tooltip title="Compartilhar" placement="top">
						<IconButton
							aria-controls="function-menu"
							aria-haspopup="true"
							className={className}
							onClick={handleClick}
						>
							<AttachFile />
						</IconButton>
					</Tooltip>
					<Menu
						id="function-menu"
						anchorEl={anchorEl}
						keepMounted
						open={Boolean(anchorEl)}
						onClose={handleClose}
						classes={{ paper: classes.menu }}
						style={{
							top: "-40px",
						}}
						anchorOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "center",
						}}
						PaperProps={{
							style: {
								boxShadow: "none",
							},
						}}
					>
						<label htmlFor="upload-button">
							<MenuItem onClick={handleClose}>
								<ListItemIcon
									className={`${classes.menuIcon} ${classes.darkBackground}`}
								>
									<Tooltip title="Compartilhar mídia" placement="right">
										<div className={classes.darkBackground}>
											<PhotoLibraryIcon className={classes.largerIcon} />
										</div>
									</Tooltip>
								</ListItemIcon>
							</MenuItem>
						</label>
						{channel === "whatsapp" && !isOficial && (
							<MenuItem onClick={() => handleOpenForwardModal()}>
								<ListItemIcon
									className={`${classes.menuIcon} ${classes.darkBackground}`}
								>
									<Tooltip title="Compartilhar contatos" placement="right">
										<div className={classes.darkBackground}>
											<ContactPhoneIcon className={classes.largerIcon} />
										</div>
									</Tooltip>
								</ListItemIcon>
							</MenuItem>
						)}
					</Menu>
				</>
		): (
			<>
				<label htmlFor="upload-button">
					<MenuItem onClick={handleClose}>
						<ListItemIcon>
							<Tooltip title="Compartilhar mídia" placement="right">
								<div className={classes.darkBackground}>
									<PhotoLibraryIcon />
								</div>
							</Tooltip>
						</ListItemIcon>
					</MenuItem>
				</label>

				{channel === "whatsapp" && !isOficial && (
					<MenuItem onClick={() => handleOpenForwardModal()}>
						<ListItemIcon>
							<Tooltip title="Compartilhar contatos" placement="right">
								<div className={classes.darkBackground}>
									<ContactPhoneIcon />
								</div>
							</Tooltip>
						</ListItemIcon>
					</MenuItem>
				)}
			</>	
		)}
	</div>
  );
};

export default TicketShareMenu;
