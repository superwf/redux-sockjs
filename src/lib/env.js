const env = process.env.NODE_ENV
const isProduction = env === 'production'

export { isProduction, env }
