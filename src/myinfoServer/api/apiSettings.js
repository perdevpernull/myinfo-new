import fs from 'fs';

var baseDir = process.cwd() + '/public';

function apiSettings (req, res, next) {
  console.log(`req.params.version(${req.params.version}) req.method(${req.method})`);
  switch (req.params.version) {
    case 'v1':
      switch (req.method) {
        case 'GET':
          // ToDo: put baseDir into some config file.
          var files = fs.readdirSync(baseDir).filter(item => (item.slice(0, 8) === 'settings')).sort().reverse();
          res.sendFile(baseDir + '/' + files[0]);
          console.log(`settings: GET (${baseDir + '/' + files[0]})`);
          break;
        case 'POST':
          var data = JSON.stringify(req.body);
          var now = new Date().toJSON().replace(/:/g, '').replace(/-/g, '');
          fs.writeFileSync(baseDir + '/settings.' + now + '.json', data);
          console.log(`settings: POST`);
          res.sendStatus(200);
          break;
        default:
          console.log(`settings: Method UNKNOWN (${req.method})`);
          res.sendStatus(404);
          break;
      }
      break;
    default:
      console.log(`settings: API Version UNKNOWN (${req.params.version})`);
      res.sendStatus(404);
      break;
  }
}

export { apiSettings };
