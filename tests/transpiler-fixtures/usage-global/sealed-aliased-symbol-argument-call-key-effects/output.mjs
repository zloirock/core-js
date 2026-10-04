import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A sealed optional lookup with an aliased symbol key precedes an argument call.
// Its receiver prefix and getter run before the key effect, once each.
const key = Symbol.iterator;
const log = [];
const box = {
  get list() {
    log.push('receiver');
    return ['held'];
  }
};
export const result = ((log.push('prefix'), box.list)?.[log.push('key'), key])(0).next().value;