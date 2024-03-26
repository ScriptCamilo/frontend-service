import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import Routes from "./routes";

import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { AuthProvider } from "./context/Auth/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";

const App = () => {
  const [locale, setLocale] = useState();

  const theme = createTheme(
    {
      typography: {
        fontFamily: `"Roboto"`,
      },
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: "4px",
          borderRadius: "50px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "50px",
          boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#42722c",
        },
      },
      palette: {
        primary: { main: "#42722c" },
      },
    },
    locale
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale =
      i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <SettingsProvider>
          <Routes />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
