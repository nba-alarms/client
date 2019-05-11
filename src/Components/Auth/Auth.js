import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab';
import DoneIcon from '@material-ui/icons/Done';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import PhoneInput from 'react-phone-number-input';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import 'react-phone-number-input/style.css';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  phone: {
    width: '200px'
  },
  button: {
    backgroundColor: green[500],
    color: 'white',
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  errorMessage: {
    color: red[500]
  }
});

class Auth extends Component {
  state = {
    isSmsSent: false,
    phoneNumber: '',
    errorMessageReCaptcha: undefined,
    errorMessageSignIn: undefined,
    code: '123456',
    redirectToReferrer: false
  };

  componentDidMount = () => {};

  handleSignIn = () => {
    const phoneNumber = this.state.phoneNumber;
    const appVerifier = window.recaptchaVerifier;
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(confirmationResult => {
        window.confirmationResult = confirmationResult;
        this.setState({ isSmsSent: true, errorMessageReCaptcha: undefined });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          errorMessageReCaptcha:
            'Verificiation Faild, did you inserted phone number?',
          isSmsSent: false
        });
        window.recaptchaVerifier.render().then(widgetId => {
          window.recaptchaVerifier.reset(widgetId);
        });
      });
  };

  handleVerifyCode = () => {
    window.confirmationResult
      .confirm(this.state.code)
      .then(function(result) {
        var user = result.user;
        console.log(user);
      })
      .catch(
        function(error) {
          console.log(error);
          this.setState({
            errorMessageSignIn:
              'Failed to sign in, did you inserted correct verification code?'
          });
        }.bind(this)
      );
  };

  render() {
    const { classes } = this.props;
    const { isSmsSent, errorMessageReCaptcha, errorMessageSignIn } = this.state;
    let { from } = this.props.location.state || { from: { pathname: '/' } };
    if (firebase.auth().currentUser) {
      return <Redirect to={from} />;
    }
    return (
      <div>
        {!isSmsSent ? (
          <Grid container className={classNames(classes.root)} justify="center">
            <Grid item xl={2} lg={2} md={4} sm={8} xs={12}>
              <Paper elevation={1}>
                <Grid
                  container
                  justify="space-around"
                  direction="column"
                  alignItems="center"
                  spacing={24}
                >
                  <Grid item>
                    <Typography variant="h6" component="h3">
                      Welcome to NBA Alarms!
                    </Typography>
                  </Grid>
                  <Grid item>
                    <PhoneInput
                      className={this.props.classes.phone}
                      country="IL"
                      placeholder="Enter phone number"
                      value={this.state.phoneNumber}
                      onChange={phoneNumber => this.setState({ phoneNumber })}
                    />
                  </Grid>
                  <Grid item>
                    <Fab
                      size="small"
                      aria-label="Add"
                      className={classes.button}
                      onClick={this.handleSignIn}
                    >
                      <DoneIcon />
                    </Fab>
                  </Grid>
                  {errorMessageReCaptcha && (
                    <Grid item>
                      <Typography className={classNames(classes.errorMessage)}>
                        {errorMessageReCaptcha}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Grid container className={classNames(classes.root)} justify="center">
            <Grid item xl={2} lg={2} md={4} sm={8} xs={12}>
              <Paper elevation={1}>
                <Grid
                  container
                  justify="space-around"
                  direction="column"
                  alignItems="center"
                  spacing={24}
                >
                  <Grid item>
                    <Typography variant="h6" component="h3">
                      Enter your verification code
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="center"
                    >
                      <Grid item>
                        <TextField
                          variant="outlined"
                          inputProps={{
                            maxLength: 6,
                            style: { textAlign: 'center' }
                          }}
                          onChange={e =>
                            this.setState({ code: e.target.value })
                          }
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Fab
                      size="small"
                      aria-label="Add"
                      className={classes.button}
                      onClick={this.handleVerifyCode}
                    >
                      <DoneIcon />
                    </Fab>
                  </Grid>
                  {errorMessageSignIn && (
                    <Grid item>
                      <Typography className={classNames(classes.errorMessage)}>
                        {errorMessageSignIn}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </div>
    );
  }
}

Auth.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Auth);
