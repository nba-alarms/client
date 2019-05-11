import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import SignOutIcon from '@material-ui/icons/ExitToApp';
import AlarmAdd from '@material-ui/icons/AlarmAdd';
import moment from 'moment';
import grey from '@material-ui/core/colors/grey';
import teamsService from '../../Services/teams.service';
import '../../Assets/Logos/bucks.png';

const styles = theme => ({
  root: {
    width: '100%'
  },
  grow: {
    flexGrow: 1
  },
  grid: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 5
  },
  paper: {
    padding: '20px 0px 20px 20px'
    // [theme.breakpoints.down('xs')]: {
    //   padding: '20px 5px 20px 20px',
    // },
    // [theme.breakpoints.down('sm')]: {
    //   padding: '20px 5px 20px 20px',
    // },
    // [theme.breakpoints.down('md')]: {
    //   padding: '20px 0px 20px 20px'
    // },
    // [theme.breakpoints.down('lg')]: {
    //   padding: '20px 0px 20px 20px'
    // }
  },
  fab: {
    margin: theme.spacing.unit
    // height: 20,
    // width: 20
  },
  signOutIcon: {
    marginRight: 0
  },
  team: {
    display: 'inline-flex',
    height: 30
  },
  image: {
    width: '30px',
    height: '30px',
    marginRight: 15
  },
  score: {
    borderRight: `2px solid ${grey[300]}`
  },
  hour: {
    // [theme.breakpoints.down('sm')]: {
    //   marginLeft: '5px'
    // }
  }
});

class Home extends Component {
  state = {
    teams: [],
    games: [],
    date: moment()
  };

  handleSignOut = () => {
    firebase.auth().signOut();
  };

  getTeam = triCode => {
    return this.state.teams.find(team => team.tricode === triCode);
  };

  getHour = game => {
    if (game.endTimeUTC) {
      return <Typography variant="body1">Final</Typography>;
    } else {
      const hour = moment(game.startTimeUTC)
        .utc()
        .add(this.state.date.utcOffset() / 60, 'hours')
        .format('H:mm');
      return <Typography variant="body1">{hour}</Typography>;
    }
  };

  renderTeam = triCode => {
    const team = this.getTeam(triCode);
    const lowerCaseNickname = team.nickname.replace(/\s/g, '').toLowerCase();
    return (
      <div className={this.props.classes.team}>
        <img
          src={require(`../../Assets/Logos/${lowerCaseNickname}.png`)}
          alt={team.nickname}
          className={this.props.classes.image}
        />
        <Typography variant="h6">{team.nickname}</Typography>
      </div>
    );
  };

  componentWillMount() {
    teamsService
      .getTeams()
      .then(result => {
        this.setState({ teams: result });
      })
      .catch(err => {
        console.error(err);
      });
  }

  componentDidMount() {
    fetch(
      `${process.env.REACT_APP_SERVER}/games/${this.state.date
        .subtract(-1, 'days')
        .format('YYYY-MM-DD')}/timezone/${this.state.date.utcOffset()}`
    )
      .then(response => {
        return response.json();
      })
      .then(result => {
        this.setState({ games: result });
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    const { classes } = this.props;
    const { teams, games } = this.state;
    if (teams.length === 0) return <div />;
    return (
      <div className={classes.root}>
        <AppBar>
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" className={classes.grow}>
              NBA Alarms
            </Typography>
            <Button
              onClick={this.handleSignOut}
              variant="contained"
              color="secondary"
              size="small"
            >
              <SignOutIcon className={classes.signOutIcon} />
            </Button>
          </Toolbar>
        </AppBar>
        <Grid container className={classes.grid}>
          <Grid item xs={12}>
            <Grid container spacing={16}>
              {games.map(game => (
                <Grid
                  key={game.gameId}
                  item
                  xl={3}
                  lg={4}
                  md={4}
                  sm={6}
                  xs={12}
                >
                  <Paper className={classes.paper}>
                    <Grid container direction="row" spacing={16}>
                      <Grid
                        item
                        xs={8}
                        container
                        direction="column"
                        spacing={8}
                      >
                        <Grid item>{this.renderTeam(game.hTeam.triCode)}</Grid>
                        <Grid item>{this.renderTeam(game.vTeam.triCode)}</Grid>
                      </Grid>
                      <Grid
                        item
                        className={classes.score}
                        xs={2}
                        container
                        direction="column"
                        spacing={8}
                      >
                        <Grid item>
                          <Typography variant="h6">
                            {game.hTeam.score}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h6">
                            {game.vTeam.score}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        container
                        xs={2}
                        direction="column"
                        alignItems="center"
                        justify="center"
                        className={classes.hour}
                      >
                        <Grid item>{this.getHour(game)}</Grid>
                        {!game.endTimeUTC && (
                          <Grid item>
                            <Fab
                              aria-label="Add"
                              size="small"
                              className={classes.fab}
                            >
                              <AlarmAdd />
                            </Fab>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
