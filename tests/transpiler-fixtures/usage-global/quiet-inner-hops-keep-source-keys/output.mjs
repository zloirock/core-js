import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// Quiet single-use hops keep legal source keys and one comment owner.
// The two receiver rows independently require Array.at and Array.includes.
const quoted = {
  wrapper: {
    data: [1]
  },
  tail: 7
};
let at, quotedTail;
({
  'wrapper' /* outer key */: {
    'data' /* inner key */: {
      at
    }
  },
  tail: quotedTail
} = quoted);
const numeric = [[[1]], 8];
let includes, numericTail;
({
  0: {
    0: {
      includes
    }
  },
  1: numericTail
} = numeric);
export const result = [at.call([4], 0), includes.call([4], '4'), quotedTail, numericTail];