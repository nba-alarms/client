import moment from 'moment';

const getGames = date => {
  const d = moment(date);
  return fetch(
    `${process.env.REACT_APP_SERVER}/games/${d.format(
      'YYYY-MM-DD'
    )}/timezone/${d.utcOffset()}`
  ).then(response => {
    return response.json();
  });
};

export default { getGames };
