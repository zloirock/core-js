import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Mixed static and instance leaves retain native array and static-property reads.
// Each instance keeps its original receiver family, in either property order.
const numbers = {
  methods: Object,
  value: [4, 8]
};
const [{
  methods: {
    is
  },
  value: {
    at
  }
}] = [numbers, mark()];
const text = {
  value: 'abc',
  methods: Math
};
const [{
  value: {
    includes
  },
  methods: {
    sign
  }
}] = [text, mark()];
export { is, at, includes, sign };