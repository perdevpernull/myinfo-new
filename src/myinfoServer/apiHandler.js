import { apiSettings } from './api/apiSettings';
import { apiUserdata } from './api/apiUserdata';
import { apiDataset } from './api/apiDataset.js';

function apiHandler (req, res, next) {
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
}

export { apiHandler };
