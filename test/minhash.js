var test = require('tape')

var sourmash = require('..')

test('MinHash: adding sequences', function (t) {
  var mh = new sourmash.minhash.MinHash(1, 4)
  mh.addSequence('ATGC')
  var a = mh.getMins()

  mh.addSequence('GCAT')
  var b = mh.getMins()

  t.deepEqual(a, b)
  t.equals(b.length, 1)

  t.end()
})

test('MinHash: size limit', function (t) {
  var mh = new sourmash.minhash.MinHash(3, 4)
  mh.addHash(10)
  mh.addHash(20)
  mh.addHash(30)
  t.deepEquals(mh.getMins(), [10, 20, 30])
  mh.addHash(5)
  t.deepEquals(mh.getMins(), [5, 10, 20])

  t.end()
})

test('MinHash: behavior with maxHash', function (t) {
  var mh = new sourmash.minhash.MinHash(0, 4, {maxHash: 35})
  mh.addHash(10)
  mh.addHash(20)
  mh.addHash(30)
  t.deepEquals(mh.getMins(), [10, 20, 30])
  mh.addHash(40)
  t.deepEquals(mh.getMins(), [10, 20, 30])
  mh.addHash(36)
  t.deepEquals(mh.getMins(), [10, 20, 30])

  t.end()
})
