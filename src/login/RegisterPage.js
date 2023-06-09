import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  Grid,
  Link,
  Paper,
  Avatar,
  CssBaseline,
  Box,
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslation } from '../common/components/LocalizationProvider';
import { snackBarDurationShortMs } from '../common/util/duration';
import { useCatch } from '../reactHelper';
import { sessionActions } from '../store';
import Bgimage from "../resources/images/login-bg.jpg";
import LogoImage from "../resources/images/logo-blue.png";
const useStyles = makeStyles((theme) => ({
  root: {
    // height: "100vh",
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
    flexBasis: "100%",
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

const RegisterPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = useCatch(async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (response.ok) {
      setSnackbarOpen(true);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <Grid container component="main" className={`${classes.root} register-main-div`}>
      <CssBaseline />
      <Grid className={classes.container}>
        {/* {useMediaQuery(theme.breakpoints.down("lg")) && (
          <LogoImage color={theme.palette.primary.main} />
        )} */}
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
              Register
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label={t("sharedName")}
                name="name"
                value={name}
                autoComplete="name"
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                type="email"
                label={t("userEmail")}
                name="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label={t("userPassword")}
                name="password"
                value={password}
                type="password"
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className={classes.submit}
                disabled={
                  !name ||
                  !password ||
                  !(server.newServer || /(.+)@(.+)\.(.{2,})/.test(email))
                }
                fullWidth
              >
                {t("loginRegister")}
              </Button>
              <Grid container>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={() => navigate("/login")}
                  >
                    {"Already have an account? Sign In"}
                    {/* {t("loginRegister")} */}
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
            </form>
          </div>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(
            sessionActions.updateServer({ ...server, newServer: false })
          );
          navigate("/login");
        }}
        autoHideDuration={snackBarDurationShortMs}
        message={t("loginCreated")}
      />
    </Grid>
  );
};

export default RegisterPage;
