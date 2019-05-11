import 'date-fns';
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
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import SignOutIcon from '@material-ui/icons/ExitToApp';
import AlarmAdd from '@material-ui/icons/AlarmAdd';
import moment from 'moment';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';
import teamsService from '../../Services/teams.service';
import gamesService from '../../Services/games.service';
import alarmsService from '../../Services/alarams.service';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';

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
    height: 100
  },

  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },

  modal: {
    position: 'absolute',
    width: '30%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    outline: 'none',
    top: '0',
    bottom: '0',
    left: '0',
    right: '0',
    margin: 'auto',
    height: '30%',

    [theme.breakpoints.down('sm')]: {
      width: '50%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '70%'
    }
  },
  row: {
    height: '100%'
  },
  fab: {
    margin: theme.spacing.unit
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
  difference: {
    marginTop: 0,
    minWidth: 120
  },
  hour: {
    // [theme.breakpoints.down('sm')]: {
    //   marginLeft: '5px'
    // }
  },
  clock: {
    color: green[700]
  },
  border1: {
    // border: `2px solid green`,
    padding: '0px 20px'
  },
  border2: {
    // border: `2px solid red`
    // borderRight: `2px solid ${grey[300]}`
    // height: '80%'
  },
  border3: {
    // border: `2px solid blue`
  }
});

class Home extends Component {
  state = {
    teams: [],
    games: undefined,
    date: moment(),
    openModal: false,
    gameSelected: undefined,
    condition: {
      period: '',
      difference: ''
    }
  };

  handleDateChange = date => {
    gamesService
      .getGames(date)
      .then(result => {
        this.setState({ games: result, date });
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleSignOut = () => {
    firebase.auth().signOut();
  };

  handleOpenModal = game => {
    this.setState({ gameSelected: game, openModal: true });
  };

  handleCloseModal = () => {
    this.setState({
      gameSelected: false,
      condition: { period: '', difference: '' },
      openModal: false
    });
  };

  handlePeriodChange = event => {
    this.setState({
      condition: { ...this.state.condition, period: event.target.value }
    });
  };

  handleDifferenceChange = event => {
    this.setState({
      condition: {
        ...this.state.condition,
        difference: parseInt(event.target.value)
      }
    });
  };

  addCondition = () => {
    // const { period, difference } = this.state.condition;
    const { gameSelected, condition } = this.state;
    if (condition.period === '' || condition.difference === '') {
      // error message
    } else {
      // post condition to the server - if succeed close modal, error - show error
      alarmsService.setAlarm(gameSelected.gameId, condition);
    }
  };

  getTeam = triCode => {
    return this.state.teams.find(team => team.tricode === triCode);
  };

  getHour = game => {
    const { classes } = this.props;
    if (game.endTimeUTC) {
      return <Typography variant="body1">Final</Typography>;
    } else if (!game.isGameActivated) {
      const hour = moment(game.startTimeUTC)
        .utc()
        .add(this.state.date.utcOffset() / 60, 'hours')
        .format('H:mm');
      return <Typography variant="body1">{hour}</Typography>;
    } else if (game.period.isHalftime) {
      return <Typography className={classes.clock}>Halftime</Typography>;
    } else {
      return (
        <Typography className={classes.clock}>
          Q{game.period.current} - {game.clock}
        </Typography>
      );
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

  renderGames = () => {
    const { games } = this.state;
    const { classes } = this.props;
    if (games && games.length === 0) {
      return <Typography>There are no games in this date</Typography>;
    } else if (games) {
      return (
        <Grid container spacing={16}>
          {games.map(game => (
            <Grid key={game.gameId} item xl={3} lg={4} md={4} sm={6} xs={12}>
              <Paper className={classes.paper}>
                <Grid container direction="row" className={classes.row}>
                  <Grid
                    item
                    xs={7}
                    className={classes.border1}
                    container
                    direction="column"
                    justify="space-around"
                  >
                    <Grid item>{this.renderTeam(game.hTeam.triCode)}</Grid>
                    <Grid item>{this.renderTeam(game.vTeam.triCode)}</Grid>
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    className={classes.border2}
                    container
                    direction="column"
                    justify="space-around"
                    alignItems="center"
                  >
                    <Grid item>
                      <Typography variant="h6">{game.hTeam.score}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6">{game.vTeam.score}</Typography>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    className={classes.border3}
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                  >
                    <Grid item>{this.getHour(game)}</Grid>
                    {!game.endTimeUTC && (
                      <Grid item>
                        <Fab
                          aria-label="Add"
                          size="small"
                          className={classes.fab}
                          onClick={this.handleOpenModal}
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
      );
    } else {
      // render is loading
      return <div />;
    }
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
    gamesService
      .getGames(this.state.date)
      .then(result => {
        this.setState({ games: result });
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    const { classes } = this.props;
    const { teams, date } = this.state;
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
        <Grid container className={classes.grid} direction="column">
          <Grid item container xs={12} justify="center">
            <Grid item>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <DatePicker
                  margin="normal"
                  label="Date picker"
                  value={date}
                  onChange={this.handleDateChange}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {this.renderGames()}
          </Grid>
        </Grid>
        <Modal open={this.state.openModal} onClose={this.handleCloseModal}>
          <div className={classes.modal}>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="quarter-id">Quarter</InputLabel>
                  <Select
                    value={this.state.condition.period}
                    onChange={this.handlePeriodChange}
                    inputProps={{
                      name: 'quarter',
                      id: 'quarter-id'
                    }}
                  >
                    <MenuItem value={1}>First</MenuItem>
                    <MenuItem value={2}>Second</MenuItem>
                    <MenuItem value={3}>Third</MenuItem>
                    <MenuItem value={4}>Fourth</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <TextField
                  style={{ marginTop: 0 }}
                  className={classes.difference}
                  id="difference"
                  label="Difference"
                  value={this.state.condition.difference}
                  onChange={this.handleDifferenceChange}
                  type="number"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  margin="normal"
                />
              </Grid>
              <Grid item>
                <Fab
                  aria-label="Add"
                  size="small"
                  className={classes.fab}
                  onClick={this.addCondition}
                >
                  <AlarmAdd />
                </Fab>
              </Grid>
            </Grid>
          </div>
        </Modal>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
