var apiSettings = require('./api/apiSettings.js');
var apiUserdata = require('./api/apiUserdata.js');
var apiDataset = require('./api/apiDataset.js');

module.exports = function (req, res, next) {
  switch (req.params.function) {
    case 'settings':
      apiSettings(req, res, next);
      break;
    case 'userdata':
      apiUserdata(req, res, next);
      break;
    case 'dataset':
      apiDataset(req, res, next);
      break;
    default:
      console.log(`API Function UNKNOWN (${req.params.function})`);
      break;
  }
};
