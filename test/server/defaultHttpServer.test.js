import http from 'http'
import defaultHttpServer from '../../server/defaultHttpServer'

describe('server/defaultHttpServer', () => {
  it('is http.Server instance', () => {
    const server = defaultHttpServer()
    expect(server).toBeA(http.Server)

    expect(server.eventNames()).toInclude('upgrade')
  })
})
