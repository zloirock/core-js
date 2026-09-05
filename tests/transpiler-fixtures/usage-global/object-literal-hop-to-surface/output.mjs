import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.global-this";
// a hop the pattern descends through an object LITERAL reaches the same built-in surface its
// identifier-init twin does, so the claim dispatches on the nav those hops NAME (`_globalThis
// .Array.prototype`) rather than on the literal they start in. a sibling key beside the hop
// changes nothing about what the hop reads; a hop landing on a user value keeps the receiver's
// own type, which is the read the source performs
const {
  w: {
    Array: {
      prototype: {
        at
      }
    }
  }
} = {
  w: globalThis
};
const {
  q: {
    w: {
      Array: {
        prototype: {
          includes
        }
      }
    }
  }
} = {
  q: {
    w: globalThis
  }
};
const {
  w: {
    Array: {
      prototype: {
        map
      }
    }
  },
  z
} = {
  w: globalThis,
  z: 1
};
const {
  y: {
    find
  }
} = {
  y: [1, 2]
};
export default [at, includes, map, z, find];