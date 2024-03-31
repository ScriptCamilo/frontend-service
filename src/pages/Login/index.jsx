import React, { useContext, useState } from "react";

import {
  Box,
  Button,
  CssBaseline,
  IconButton,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";
// import { deskChatVersion } from "../../version";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    display: "flex",
    alignItems: "center",
  },

  container: {
    display: "flex",
    flexDirection: "column ",
    height: "100vh",
    width: "50vw",
    boxShadow: "-10px 0 30px 30px rgba(0, 0, 0, 0.7)",
    zIndex: 1,

    // if mobile
    [theme.breakpoints.down(960)]: {
      width: "100vw",
    },
  },

  paper: {
    margin: "auto",
    marginBottom: "35vh",
    width: "25vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    [theme.breakpoints.down(960)]: {
      width: "50vw",
    },
  },

  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },

  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  nm: {
    [`& fieldset`]: {
      borderRadius: 0,
    },
  },

  submit: {
    margin: theme.spacing(3, 0, 2),
    // margin: "auto",
    width: "50%",
    borderRadius: 20,
  },

  logo: {
    width: "70%",
  },

  wpp: {
    height: "100vh",
    width: "50vw",
    objectFit: "cover",

    // if mobile
    [theme.breakpoints.down(960)]: {
      display: "none",
    },
  },
}));

const Login = () => {
  const classes = useStyles();

  const { handleLogin } = useContext(AuthContext);

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  console.log('PROCESSO DE LIVE RELOAD ESTÁ FUNCIONANDO!')

  return (
    <>
      <div className={classes.root} component="main">
        <CssBaseline />
        <div className={classes.container}>
          <div className={classes.paper}>
            <img className={classes.logo} src="/deskrio-logo.webp" alt="logo" />

            {/* <Typography component="h1" variant="h5">
            {i18n.t("login.title")}
          </Typography> */}
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                size="small"
                margin="normal"
                required
                fullWidth
                id="email"
                label={i18n.t("login.form.email")}
                name="email"
                value={user.email}
                onChange={handleChangeInput}
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                size="small"
                margin="normal"
                required
                fullWidth
                name="password"
                label={i18n.t("login.form.password")}
                id="password"
                value={user.password}
                onChange={handleChangeInput}
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((e) => !e)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {i18n.t("login.buttons.submit")}
              </Button>
              {/* <Grid container>
            <Grid item>
              <Link
                href="#"
                variant="body2"
                component={RouterLink}
                to="/signup"
              >
                {i18n.t("login.buttons.register")}
              </Link>
            </Grid>
          </Grid> */}

              {/* <Typography variant="body2" color="textSecondary" align="center">
                Todos os direitos reservados - DESKRIO
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                <i>www.deskrio.com.br</i>
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                <strong>{` v${deskChatVersion}`}</strong>
              </Typography> */}
            </form>
          </div>
        </div>

        <img className={classes.wpp} src="/login_wpp.jpg" alt="logo" />
        <Box mt={8}>{/* <Copyright /> */}</Box>
      </div>
    </>
  );
};

export default Login;
