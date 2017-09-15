'use strict'
const path = require('path')
const fs = require('fs')

class SBT {
  constructor (factory, d = 2, storage = undefined) {
    this.factory = factory
    this.d = d
    this.storage = storage
    this.nodes = new Map()
  }

  static load (loc, leafLoader, storage) {
    var loaders = new Map()
    loaders.set(3, this._loadV3)

    var dirname = path.dirname(loc)
    var sbtName = path.basename(loc)
    if (sbtName.endsWith('.sbt.json')) {
      sbtName = sbtName.slice(0, -9)
    }

    if (leafLoader === undefined) {
      leafLoader = Leaf.load
    }

    var sbtFullPath = path.join(dirname, sbtName + '.sbt.json')
    var contents = fs.readFileSync(sbtFullPath, 'utf8', 'r')
    var jnodes = JSON.parse(contents)

    var version = jnodes['version']

    /* TODO: check storage */

    return loaders.get(version)(jnodes, leafLoader, dirname, storage)
  }

  save (tag, storage) {
  }

  static _loadV3 (info, leafLoader, dirname, storage) {
    if (info['nodes']['0'] === undefined) {
      throw new Error('Empty tree!')
    }

    /* TODO: storage handling */

    /* TODO: figure out nodegraph info */
    let nodeFactory

    var sbtNodes = new Map()
    for (let k of Object.keys(info['nodes'])) {
      var node = info['nodes'][k]

      let sbtNode
      if (node['name'].includes('internal')) {
        sbtNode = Node.load(node, storage)
      } else {
        sbtNode = leafLoader(node, storage)
      }

      sbtNodes.set(parseInt(k), sbtNode)
    }

    var tree = new SBT(nodeFactory, {d: parseInt(info['d']), storage: storage})
    tree.nodes = sbtNodes
    return tree
  }
}

class Node {
  constructor (factory, name, path, storage) {
    this.name = name
    this.storage = storage
    this.factory = factory
    this._data = undefined
    this._path = path
  }

  static load (info, storage) {
    return new Node(info['factory'], info['name'], info['filename'], storage)
  }
}

class Leaf {
  constructor (metadata, data, name, path, storage) {
    this.metadata = metadata

    if (name === undefined) {
      name = metadata
    }
    this.name = metadata

    this.storage = storage

    this._data = data
    this._path = path
  }

  static load (info, storage) {
    return new Leaf(info['metadata'], info['name'], info['filename'], storage)
  }
}

module.exports = {
  SBT: SBT,
  Node: Node,
  Leaf: Leaf
}
