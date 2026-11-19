import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// The right-hand side of a DESTRUCTURING ASSIGNMENT runs before every slot of the pattern it fills,
// so the `o.f = 'str'` it carries is not ranked against the earlier `this.f.at(0)` by source
// position. A host lookup that only knew the declarator spelling would miss this one and keep the
// stale array narrow.
const o = {
  f: [1, 2],
  m() {
    return this.f.at(0);
  }
};
o.m();
let q;
[q] = [o.f = 'str'];
export { q };