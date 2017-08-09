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
                        logger.info("Hash validation success");
                        body = JSON.parse(body);
                        let executeCommand = '';
                        if(typeof body.ref == 'string') {
                            let branch = body.ref.split('/')[req.ref.length - 1];
                            logger.info('branch: '+branch);
                            if(typeof apps[app].branch[branch] == 'string') {
                                executeCommand = apps[app].branch[req.ref.last];
                                logger.info(branch+" has execute commands");
                            } else if(typeof apps[app].default == 'string' ) {
                                executeCommand = apps[app].default;
                                logger.info("default command");
                            } else {
                                executeCommand = null;
                                logger.info("not has command");
                            }
                        } else {
                            logger.info("branch not found");
                            logger.debug(body.ref);
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