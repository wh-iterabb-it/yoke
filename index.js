
class Yoke {
  constructor (config, server) {
    const http = require('http');
    this.config = config;

    this.server = server;

    this.port = config.server.port;

    app.set('port', this.port);
    this.instance = http.createServer(this.server);
  }
  /**
   * onError processes server error events
   * @param {error} - error object which denotes a internal error
   */
  onError (e) {
    logger.warn('error with server.');

    if (e.syscall !== 'listen') {
      throw e;
    }

    const bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    switch (e.code) {
      case 'EACCES':
        logger.error('port %d requires elevated privileges. ', bind);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error('port %d is already in use. ', bind);
        process.exit(1);
        break;
      default:
        throw e;
    }
  }

  /**
   * listen binder
   */
  onListening () {
    logger.info('yoke server is starting...');
    // get server ip address
    const addr = this.instance.address();
    //
    const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    logger.info(`listening on ${bind}`);
  }

  /**
   * onMessage
   * message listener
   * @param {number|string} msg
   */
  onMessage (msg) {
    if (msg === 'shutdown') {
      logger.info('application shutting down...');
      this.instance.close();
      process.exit(0);
    }
  }

  /**
   * onProcessSignal
   * processes system signals
   * @param {number|string} msg
   */
  onProcessSignal (msg) {
    logger.info('application is shutting down...');

    // Close server
    this.instance.close();

    // Check if this was a shutdown message and exit cleanly
    if (msg && msg === 'shutdown') {
      process.exit(0);
    }

    process.exit(1);
  }

  onStartup () {
    // Create and start server
    this.instance.listen(this.port);
    this.instance.on('error', this.onError);
    this.instance.on('listening', this.onListening);

    // Process system signals
    process.on('message', this.onMessage);
    process.on('SIGTERM', this.onProcessSignal);
  }
};


module.exports.default = Yoke;
