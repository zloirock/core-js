import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.keys";
import "core-js/modules/web.dom-collections.keys";
// A compound write derives its value. The original static is only a candidate; the
// unclassified result keeps generic instance imports as well.
const cc = {
  c: Object
};
cc.c += 1;
const {
  c: {
    keys: literalOnly
  }
} = cc;
export { literalOnly };