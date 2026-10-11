import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol from "@core-js/pure/actual/symbol";
// a binding taken off a selection spelled in place, off a member of one, off a logical fallback or a sequence's
// tail stands for the path under each container it may yield, as one taken off a name holding it does - so a
// constructor written through it keeps its statics, and a static read back is no longer the literal's to fold
const first = {
  inner: {
    C: Object
  }
};
const second = {
  inner: {
    C: Object
  }
};
const {
  inner: viaPattern
} = flag ? first : second;
viaPattern.C = _Map;
export const grouped = first.inner.C.groupBy([1], x => x);
const left = {
  inner: {
    C: Object
  }
};
const right = {
  inner: {
    C: Object
  }
};
const viaMember = (flag ? left : right).inner;
viaMember.C = _Promise;
export const settled = left.inner.C.allSettled([]);
const tail = {
  inner: {
    C: Object
  }
};
const viaSequence = (log(), tail).inner;
viaSequence.C = _Symbol;
export const registered = tail.inner.C.for('a');
const kept = {
  inner: {
    C: Array
  }
};
const spare = {
  inner: {
    C: Array
  }
};
const {
  inner: viaFallback
} = kept || spare;
viaFallback.C = _Iterator;
export const fallen = kept.inner.C.from([2]);