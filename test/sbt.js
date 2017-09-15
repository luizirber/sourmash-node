var test = require('tape')

var sourmash = require('..')

test('SBT: load empty tree', function (t) {
  t.throws(function () {
    sourmash.sbt.SBT.load('test/test-data/empty.sbt.json')
  }, Error, 'Empty tree!')
  t.end()
})

test('SBT: load existing tree', function (t) {
  var tree = sourmash.sbt.SBT.load('test/test-data/v3.sbt.json')
  t.ok(tree.nodes.get(0))
  t.ok(typeof tree.nodes.get(0), sourmash.sbt.Node)
  t.ok(typeof tree.nodes.get(12), sourmash.sbt.Leaf)
  t.end()
})
