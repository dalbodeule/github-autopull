process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

const http = require('http'), crypto = require('crypto'), exec = require('child_process').exec,
apps = require(__dirname+'/apps.json'), config = require(__dirname+'/config.json'), logger = require('log4js').getLogger(),

server = http.createServer((req, res) => {
    if(req.method == 'POST') {
        for(let app in apps) {
            if(apps[app].url == req.url) {
                logger.info(app+' POST Reveived');
                let body = '';
                req.on('data', (data) => {
                    body += data;
                });
                req.on('end', () => {
                    let hash = 'sha1='+crypto.createHmac('sha1', apps[app].secret).update(body).digest('hex');
                    if(hash == req.headers['x-hub-signature']) {
                        exec(apps[app].command, (err, stdout, stderr) => {
                            logger.info('====== command exex ======');
                            logger.info(stdout);
                            logger.info('====== command exec ======');
                            if(err) {
                                logger.error('====== command error ======');
                                logger.error(err);
                                logger.error('====== command error ======');
                            }
                            if(stderr) {
                                logger.error('====== command stderr ======');
                                logger.error(stderr);
                                logger.error('====== command stderr ======');
                            }
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.end('post received');
                        });
                    } else {
                        res.status(400);
                        logger.error('Key is not match!');
                        logger.info('Github key is '+req.headers['x-hub-signature']);
                        logger.info('and local task key is '+hash);
                        res.writeHead(400, {'Content-Type': 'text/html'});
                        res.end('Key is not match');
                    }
                });
            }
        }
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('');
    }
});

const HTTPServer = http.createServer(server);
HTTPServer.listen(config.http_port, () => {
    logger.info('HTTP Listening!');
    logger.info('address: '+HTTPServer.address().address);
    logger.info('port: '+HTTPServer.address().port);
});