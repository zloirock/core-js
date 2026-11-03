import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A prefix write names the realm at the following read, without admitting an effectful hop.
let realm;
export const {
  Array: {
    from
  }
} = (prefix(), realm = globalThis, realm)[key(), 'self'];