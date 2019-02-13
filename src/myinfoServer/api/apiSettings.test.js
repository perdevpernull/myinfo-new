var http = require('http');
var listeningPort = 8080;

describe('server api', () => {
  describe('#apiSettings', () => {
    describe('#GET', () => {
      it('Should return the latest setings*.json from public dir', (done) => {
        http.get(`http://localhost:${listeningPort}/api/v1/settings`, function (res) {
          var tmp = res.statusCode;
          expect(tmp).toEqual(200);
          res.resume();
          var rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            var tmp = JSON.parse(rawData); // eslint-disable-line no-unused-vars
            done();
          });
        });
      });

      it('Should return 404 on wrong version', (done) => {
        http.get(`http://localhost:${listeningPort}/api/v0/settings`, function (res) {
          var tmp = res.statusCode;
          expect(tmp).toEqual(404);
          done();
        });
      });

      it('Should return 404 on not in (GET, POST)', (done) => {
        var options = {
          hostname: 'localhost',
          port: listeningPort,
          path: '/api/v1/settings',
          method: 'PUT'
        };

        var req = http.request(options, function (res) {
          var tmp = res.statusCode;
          expect(tmp).toEqual(404);
          done();
        });
        req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
        });
        req.end();
      });
    });

    /* describe('#POST', () => {
      it('Should store the sent settings into a file', () => {
        expect(1).toEqual(2);
      });
    }); */
  });
});
