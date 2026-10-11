import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// a binding takes its slot off a container the same way whichever host destructures it, so a constructor
// written through it reaches a static read back through the container's path - an assignment pattern, an
// array pattern, a for-of head over a literal, a catch parameter of a thrown container, and a defaulted
// parameter
const holder = {
  inner: {
    C: Object
  }
};
let alias;
({
  inner: alias
} = holder);
alias.C = _Map;
export const grouped = holder.inner.C.groupBy([1], x => x);
const list = [{
  C: Array
}];
const [first] = list;
first.C = _Promise;
export const settled = list[0].C.allSettled([]);
const nest = {
  inner: {
    C: Object
  }
};
for (const {
  inner: each
} of [nest]) each.C = _Symbol;
export const registered = nest.inner.C.for('a');
const thrown = {
  inner: {}
};
try {
  throw thrown;
} catch ({
  inner: caught
}) {
  caught.C = _URL;
}
export const valid = thrown.inner.C.canParse('a:b');
const box = {
  inner: {
    C: Array
  }
};
function fill({
  inner: slot
} = box) {
  slot.C = _Iterator;
}
fill();
export const copied = box.inner.C.from([1]);