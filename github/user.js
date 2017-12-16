const axios = require('axios');

const getUserID = token => axios
  .get('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
    },
  })
  .then(user => user.id);

module.exports = {
  getUserID,
};
