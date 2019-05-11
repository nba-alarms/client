import * as firebase from 'firebase/app';
import 'firebase/auth';

const setAlarm = async (gameId, condition) => {
  return firebase
    .auth()
    .currentUser.getIdToken(false)
    .then(idToken => {
      return fetch(`${process.env.REACT_APP_SERVER}/alarms`, {
        method: 'POST',
        headers: new Headers({
          idToken,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ gameId, condition })
      }).then(response => {
        return response.json();
      });
    })
    .catch(err => {
      return err;
    });
};

export default { setAlarm };
