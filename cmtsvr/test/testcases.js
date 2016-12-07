const foo = async (x) => x + 1
const assert = require('assert')

describe('Synchronous tests', () => {
  it('should work', () => {
    const x = 3 + 1
    assert.equal(x, 4)
  })
})

describe('Asynchronous tests', () => {
  it('should work', async () => {
    const x = await foo(3)
    assert.equal(x, 4)
  })
})
