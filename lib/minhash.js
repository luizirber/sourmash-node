'use strict'

var binarysearch = require('binarysearch')
var murmurhash = require('node-murmurhash')

class MinHash {
  constructor (ksize, n, isProtein, trackAbundance, scaled, seed) {
    this.ksize = ksize
    this.n = n
    this.is_protein = isProtein
    this.track_abundance = trackAbundance
    this.scaled = scaled
    this.seed = seed
    this.mins = []
  }

  addSequence (seq, force) {
    if (seq.length < this.ksize) {
      return
    }
    for (var i = 0; i < seq.length - this.ksize + 1; i++) {
      var kmer = seq.substr(i, this.ksize)
      var rc = revcomp(kmer)
      if (kmer < rc) {
        this.addWord(kmer)
      } else {
        this.addWord(rc)
      }
    }
  }

  addHash (hashed) {
    if ((this.max_hash && hashed <= this.max_hash) || !this.max_hash) {
      if (this.mins.length === 0) {
        this.mins.push(hashed)
      } else if (hashed <= this.max_hash ||
                 this.mins[this.mins.length - 1] > hashed ||
                 this.mins.length < this.num) {
        var pos = binarysearch(this.mins, hashed)
        if (pos === this.mins.length) {
          this.mins.push(hashed)
        } else if (this.mins[pos] !== hashed) {
          this.mins.splice(pos, 0, hashed)
          if (this.num && this.mins.length > this.num) {
            this.mins.pop()
          }
        }
      }
    }
  }

  addWord (word) {
    var hashed = murmurhash(word, this.seed)
    this.addHash(hashed)
  }
}

function revcomp (seq) {
  var conversion = new Map([
    ['A', 'T'],
    ['T', 'A'],
    ['C', 'G'],
    ['G', 'C']
  ])

  return Array.prototype.map.call(seq, function (x) {
    return conversion[x.toUpperCase()]
  }).reverse().join('')
}

module.exports = {
  MinHash: MinHash
}
