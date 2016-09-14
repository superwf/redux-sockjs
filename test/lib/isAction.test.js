import isAction from '../../lib/isAction'

describe('lib/isAction', () => {
  it('action must has type and payload', () => {
    expect(isAction({})).toBe(false)
    expect(isAction()).toBe(false)
    expect(isAction({ type: 'zbc' })).toBe(true)
    expect(isAction({ payload: 'zbc' })).toBe(false)
    expect(isAction({ type: 'xxx', payload: 'zbc' })).toBe(true)
  })
})
