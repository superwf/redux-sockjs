import warn from '../../lib/warn'

describe('lib/warn', () => {
  it('warn invoke console.warn', () => {
    const spy = expect.spyOn(console, 'warn')
    expect(spy).toNotHaveBeenCalled()

    warn('abc')
    expect(spy).toHaveBeenCalledWith('abc')
    expect.restoreSpies()
  })
})
