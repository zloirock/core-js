import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$values from "@core-js/pure/actual/object/values";
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
} = (build(), {
  k: [{
    entries: _Object$entries
  }]
});
use(viaCall({}));
for (const {
  k: [{
    values: viaCallHead
  }]
} of [(build(), {
  k: [{
    values: _Object$values
  }]
})]) use(viaCallHead({}));
function viaCallDefault({
  k: [{
    fromEntries
  }]
} = (build(), {
  k: [{
    fromEntries: _Object$fromEntries
  }]
})) {
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
} = (wrap(Object), {
  k: [, {
    hasOwn: _Object$hasOwn
  }]
});
use(viaArgument({}, 'k'));
const deep = {
  k: [[Object]]
};
const {
  k: [[{
    assign: viaDeep
  }]]
} = {
  k: [[{
    assign: _Object$assign
  }]]
};
use(viaDeep({}, {}));
const wrapped = [{
  k: [Object]
}];
const viaWrapped = _Object$is;
use(viaWrapped(1, 1));