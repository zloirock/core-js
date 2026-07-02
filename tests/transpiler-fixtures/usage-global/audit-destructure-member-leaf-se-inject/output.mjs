import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// same injection contract for an SE-bearing IIFE under a member hop: classification resolves the
// leaf through the inline call, the import lands, the text stays verbatim
let calls = 0;
const [{
  from
}] = [(() => {
  calls++;
  return globalThis;
})().Array];