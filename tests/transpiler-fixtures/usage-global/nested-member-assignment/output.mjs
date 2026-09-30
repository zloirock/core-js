import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A sole nested assignment claim owns one read of its member root, just like a declaration.
const wrap = {
  box: {
    data: [1, 2]
  }
};
let at;
({
  data: {
    at
  }
} = wrap.box);
const other = {
  Box: {
    Inner: {
      Text: 'abc'
    }
  }
};
let includes;
({
  Inner: {
    Text: {
      includes
    }
  }
} = other.Box);