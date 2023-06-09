import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  useMediaQuery,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Avatar,
  CssBaseline,
  Grid,
  Box,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sessionActions } from "../store";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  useLocalization,
  useTranslation,
} from "../common/components/LocalizationProvider";
import usePersistedState from "../common/util/usePersistedState";
import {
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from "../common/components/NativeInterface";
import MobileLogo from './LogoImage'
import LogoImage from "../resources/images/logo-blue.png";
import { useCatch } from "../reactHelper";
import Bgimage from "../resources/images/login-bg.jpg";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundImage: `url(${Bgimage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : theme.palette.grey[900],

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    margin: "20px auto",
  },
  size: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "40px",
  },

  paper: {
    margin: theme.spacing(2, 6),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(0),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  // ----my-design---
  options: {
    position: "fixed",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: "flex",
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: "unset",
  },
  resetPassword: {
    cursor: "pointer",
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState("loginEmail", "");
  const [password, setPassword] = useState("");

  const registrationEnabled = useSelector(
    (state) => state.session.server.registration
  );
  const languageEnabled = useSelector(
    (state) => !state.session.server.attributes["ui.disableLoginLanguage"]
  );
  const emailEnabled = useSelector(
    (state) => state.session.server.emailEnabled
  );
  const openIdEnabled = useSelector(
    (state) => state.session.server.openIdEnabled
  );
  const openIdForced = useSelector(
    (state) =>
      state.session.server.openIdEnabled && state.session.server.openIdForce
  );

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector(
    (state) => state.session.server.announcement
  );

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = "";
      try {
        const expiration = moment().add(6, "months").toISOString();
        const response = await fetch("/api/session/token", {
          method: "POST",
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = "";
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        body: new URLSearchParams(
          `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate("/");
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(
      `/api/session?token=${encodeURIComponent(token)}`
    );
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password) {
      handlePasswordLogin(e);
    }
  };

  const handleOpenIdLogin = () => {
    document.location = "/api/session/openid/auth";
  };

  useEffect(() => nativePostMessage("authentication"), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <LinearProgress />;
  }

  return (
    <Grid
      container
      component="main"
      className={`${classes.root} register-main-div`}
    >
      <CssBaseline />
      <div className={classes.options}>
        {nativeEnvironment && (
          <Tooltip title={t("settingsServer")}>
            <IconButton onClick={() => navigate("/change-server")}>
              <LockOpenIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <Grid className={classes.container} container>
        <Grid
          className={classes.size}
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={1}
          square
        >
          <div className={classes.paper}>
            <div className={classes.logoImage}>
              <img src={LogoImage} alt={"logo.png"} width={150} />
            </div>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                error={failed}
                required
                fullWidth
                id="username"
                label={t("userEmail")}
                name="email"
                value={email}
                autoComplete="email"
                autoFocus={!email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyUp={handleSpecialKey}
                helperText={failed && "Invalid username or password"}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={failed}
                label={t("userPassword")}
                value={password}
                autoFocus={!!email}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleSpecialKey}
              />

              <div className={classes.extraContainer}>
                {/*   <Button
                  className={classes.registerButton}
                  onClick={() => navigate("/register")}
                  disabled={!registrationEnabled}
                  color="secondary"
                >
                  {t("loginRegister")}
                </Button>
                */}
                {languageEnabled && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t("loginLanguage")}</InputLabel>
                    <Select
                      label={t("loginLanguage")}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {languageList.map((it) => (
                        <MenuItem key={it.code} value={it.code}>
                          {it.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onKeyUp={handleSpecialKey}
                disabled={!email || !password}
                onClick={handlePasswordLogin}
              >
                {t("loginLogin")}
              </Button>

              {openIdEnabled && (
                <Button
                  onClick={() => handleOpenIdLogin()}
                  variant="contained"
                  color="secondary"
                >
                  {t("loginOpenId")}
                </Button>
              )}

              <Grid container>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={() => navigate("/register")}
                    disabled={!registrationEnabled}
                  >
                    {"Don't have an account? Sign Up"}
                    {/* {t("loginRegister")} */}
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </form>
            {emailEnabled && (
              <Link
                onClick={() => navigate("/reset-password")}
                className={classes.resetPassword}
                underline="none"
                variant="caption"
              >
                {t("loginReset")}
              </Link>
            )}
          </div>
        </Grid>
      </Grid>
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setAnnouncementShown(true)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Grid>
  );
};

export default LoginPage;
