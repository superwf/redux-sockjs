import remove from '../../lib/remove'

describe('lib/remove', () => {
  it('remove item from array', () => {
    const a = [1, 2, 4]
    expect(remove(a, 2)).toBe(true)
    expect(a).toEqual([1, 4])

    const b = [1, 3, 4]
    expect(remove(b, 2)).toBe(false)
    expect(b).toEqual([1, 3, 4])
  })
})
