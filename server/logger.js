import log4js from 'log4js'

log4js.configure({
  appenders: [{
    type: 'file',
    filename: 'server.log',
    category: 'dev',
  }],
})

const logger = log4js.getLogger('dev')
logger.setLevel('DEBUG')

export default logger
