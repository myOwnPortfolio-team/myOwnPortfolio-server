const axios = require('axios');

const getUserID = token => axios
  .get('https://api.github.com/user', {
    headers: {
      'Content-Type': 'text/json',
      Authorization: `token ${token}`,
    },
  })
  .then(res => res.data.id);

module.exports = {
  getUserID,
};
