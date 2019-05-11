const getTeams = () => {
  return fetch(`${process.env.REACT_APP_SERVER}/teams`).then(response => {
    return response.json();
  });
};

module.exports = { getTeams };
