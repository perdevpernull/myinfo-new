import fs from 'fs';

var baseDir = 'p:/myinfo/public';

function apiUserdata (req, res, next) {
  switch (req.params.version) {
    case 'v1':
      switch (req.method) {
        case 'GET':
          // ToDo: put baseDir into some config file.
          var files = fs.readdirSync(baseDir + '/' + req.session.userID).filter(item => (item.slice(0, 8) === 'userdata')).sort().reverse();
          res.sendFile(baseDir + '/' + req.session.userID + '/' + files[0]);
          console.log(`userdata: GET (${baseDir + '/' + req.session.userID + '/' + files[0]})`);
          break;
        case 'POST':
          var data = JSON.stringify(req.body);
          var now = new Date().toJSON().replace(/:/g, '').replace(/-/g, '');
          fs.writeFileSync(baseDir + '/' + req.session.userID + '/userdata.' + now + '.json', data);
          console.log(`userdata: POST`);
          res.sendStatus(200);
          break;
        default:
          console.log(`userdata: Method UNKNOWN (${req.method})`);
          break;
      }
      break;
    default:
      console.log(`userdata: API Version UNKNOWN (${req.params.version})`);
      break;
  }
}

export { apiUserdata };
