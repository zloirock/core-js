import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the level under the key may come from a CALL yielding the container - under a declarator, a for-of
// head and a parameter default - from a slot the callee fills from a parameter, from a nested array
// level, or from a container wrapped in an outer array. one static per row
const build = () => ({
  k: [Object]
});
const {
  k: [{
    entries: viaCall
  }]
} = build();
use(viaCall({}));
for (const {
  k: [{
    values: viaCallHead
  }]
} of [build()]) use(viaCallHead({}));
function viaCallDefault({
  k: [{
    fromEntries
  }]
} = build()) {
  return fromEntries([]);
}
use(viaCallDefault());
const wrap = value => ({
  k: [1, value]
});
const {
  k: [, {
    hasOwn: viaArgument
  }]
} = wrap(Object);
use(viaArgument({}, 'k'));
const deep = {
  k: [[Object]]
};
const {
  k: [[{
    assign: viaDeep
  }]]
} = deep;
use(viaDeep({}, {}));
const wrapped = [{
  k: [Object]
}];
const [{
  k: [{
    is: viaWrapped
  }]
}] = wrapped;
use(viaWrapped(1, 1));