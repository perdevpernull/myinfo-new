import fs from 'fs';

var baseDir = 'p:/myinfo/public';

function apiDataset (req, res, next) {
  switch (req.params.version) {
    case 'v1':
      switch (req.method) {
        case 'GET':
          // ToDo: put baseDir into some config file.
          if (fs.existsSync(baseDir + '/' + req.session.userID + '/' + req.query.name)) {
            var files = fs.readdirSync(baseDir + '/' + req.session.userID + '/' + req.query.name).sort().reverse();
            if (files.length > 0) {
              res.sendFile(baseDir + '/' + req.session.userID + '/' + req.query.name + '/' + files[0]);
            } else {
              res.send('{}');
            }
          } else {
            fs.mkdirSync(baseDir + '/' + req.session.userID + '/' + req.query.name);
            res.send('{}');
          }
          console.log(`dataset: GET`);
          break;
        case 'POST':
          var data = JSON.stringify(req.body);
          var now = new Date().toJSON().replace(/:/g, '').replace(/-/g, '');
          fs.writeFileSync(baseDir + '/' + req.session.userID + '/' + req.query.name + '/' + req.query.name + '.' + now + '.json', data);
          console.log(`dataset: POST`);
          res.sendStatus(200);
          break;
        default:
          console.log(`dataset: Method UNKNOWN (${req.method})`);
          break;
      }
      break;
    default:
      console.log(`dataset: API Version UNKNOWN (${req.params.version})`);
      break;
  }
}

export { apiDataset };
