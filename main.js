process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

const http = require('http'), crypto = require('crypto'), exec = require('child_process').exec,
apps = require(__dirname+'/apps.json'), config = require(__dirname+'/config.json'), logger = require('log4js').getLogger();

Array.prototype.last = () => {
    return this[this.length - 1];
}

const server = http.createServer((req, res) => {
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
                        let executeCommand = '';
                        if(typeof req.ref == 'string') {
                            if(typeof apps[app].branch[req.ref.split('/')[req.ref.length - 1]] == 'string') {
                                executeCommand = apps[app].branch[req.ref.last];
                            } else if(typeof apps[app].default == 'string' ) {
                                executeCommand = apps[app].default;
                            } else {
                                executeCommand = null;
                            }
                        } else {
                            executeCommand = null;
                        }

                        if(executeCommand != null) {
                            exec(executeCommand, (err, stdout, stderr) => {
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
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.end('');
                        }
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

server.listen(config.http_port, () => {
    logger.info('HTTP Listening!');
    logger.info('address: '+server.address().address);
    logger.info('port: '+server.address().port);
});