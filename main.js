process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV ).trim().toLowerCase() == 'production' ) ? 'production' : 'development';

const http = require('http'), express = require('express'), crypto = require('crypto'), exec = require('child_process').exec,
apps = require(__dirname+'/apps.json'), config = require(__dirname+'/config.json'), logger = require('log4js').getLogger();

const server = express();

server.post('*', (req, res) => {
    for(let app in apps) {
        if(apps[app].url == req.originalUrl) {
            logger.info(app+' POST Reveived');
            const hmac = crypto.createHmac('sha1', apps[app].secret);
            let signature = 'sha1-'+hmac.digest('hex');
            if(req.headers['x-hub-signature'] == signature) {
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
                });
            } else {
                logger.error('Key is not match!');
            }
        }
    }
    res.send('').end();
});
server.all('*', (req, res) => {
    res.send('').end();
});

const HTTPServer = require('http').createServer(server);
HTTPServer.listen(config.http_port, () => {
    logger.info('HTTP Listening!');
    logger.info('address: '+HTTPServer.address().address);
    logger.info('port: '+HTTPServer.address().port);
});