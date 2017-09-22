'use strict'

var murmurhash = require('node-murmurhash')

const MINHASH_DEFAULT_SEED = 42
const MINHASH_MAX_HASH = 0xffffffffffffffff

class MinHash {
  constructor (n, ksize,
               isProtein = false,
               trackAbundance = false,
               seed = MINHASH_DEFAULT_SEED,
               maxHash = 0,
               mins = undefined,
               scaled = 0) {
    this.ksize = ksize
    this.num = n
    this.isProtein = isProtein

    if (maxHash && scaled) {
      throw Error('cannot set both maxHash and scaled')
    } else if (scaled) {
      maxHash = getMaxHashForScaled(scaled)
    }
    this.maxHash = maxHash

    this.seed = seed

    this.trackAbundance = trackAbundance
    if (trackAbundance) {
      this.mins = new Map()
    } else {
      this.mins = []
    }

    if (mins) {
      if (this.trackAbundance) {
        // set_abundances
      } else {
        // add_many
      }
    }
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
    if ((this.maxHash && hashed <= this.maxHash) || !this.maxHash) {
      if (this.mins.length === 0) {
        this.mins.push(hashed)
      } else if (hashed <= this.maxHash ||
                 this.mins[this.mins.length - 1] > hashed ||
                 this.mins.length < this.num) {
        var pos = lowerBound(this.mins, hashed)
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

  getMins () {
    return this.mins.slice()
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

function lowerBound (seq, elem) {
  var low = 0
  var high = seq.length - 1
  var mid = 0

  while (low <= high) {
    mid = low + Math.floor((high - low) / 2)
    if (seq[mid] >= elem) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }

  return low
}

function getMaxHashForScaled (scaled) {
  if (scaled === 0) {
    return 0
  } else if (scaled === 1) {
    return MINHASH_MAX_HASH
  }

  return Math.floor(MINHASH_MAX_HASH / scaled)
}

module.exports = {
  MinHash: MinHash
}
