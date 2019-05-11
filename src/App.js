import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as firebase from 'firebase/app';
import { config } from './config';
import 'firebase/auth';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Auth from './Components/Auth/Auth';
import Home from './Components/Home/Home';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';

firebase.initializeApp(config);

const styles = theme => ({
  recaptcha: {
    left: 0
  }
});

class App extends Component {
  state = {
    isUserLoggedIn: undefined
  };

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log('user logged in');
        this.setState({ isUserLoggedIn: true });
      } else {
        console.log('user signed out');
        this.setState({ isUserLoggedIn: false });
      }
    });

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      this.recaptcha,
      {
        size: 'invisible',
        'expired-callback': function() {
          window.recaptchaVerifier.render().then(widgetId => {
            window.recaptchaVerifier.reset(widgetId);
          });
        }
      }
    );
    window.recaptchaVerifier.render().then(function(widgetId) {
      window.recaptchaWidgetId = widgetId;
    });
  };

  render() {
    const { classes } = this.props;
    const { isUserLoggedIn } = this.state;

    return (
      <div>
        <div
          className={classes.recaptcha}
          ref={ref => (this.recaptcha = ref)}
        />
        {isUserLoggedIn !== undefined && (
          <Router>
            <PrivateRoute
              exact
              path="/"
              component={Home}
              isUserLoggedIn={isUserLoggedIn}
            />
            <Route
              exact
              path="/login"
              render={props => (
                <Auth {...props} isUserLoggedIn={isUserLoggedIn} />
              )}
            />
          </Router>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(App);
