import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
let r1, r2, r3, r4, r5;
try {
  const {
    a: {
      from
    }
  } = container;
  r1 = from([1]).length;
} catch (error) {
  r1 = _nameMaybeFunction(error);
}
try {
  const alias = container;
  const {
    a: {
      from
    }
  } = alias;
  r2 = from([1]).length;
} catch (error) {
  r2 = _nameMaybeFunction(error);
}
try {
  const [{
    from
  }] = wrapper;
  r3 = from([1]).length;
} catch (error) {
  r3 = _nameMaybeFunction(error);
}
{
  const {
    [key]: from
  } = Array;
  r4 = typeof from;
}
{
  const [{
    of
  } = {
    of: _Array$of
  }] = [slot];
  r5 = of(1)[0];
}
let r6;
try {
  const {
    Array: {
      from
    }
  } = realm();
  r6 = from([1]).length;
} catch (error) {
  r6 = _nameMaybeFunction(error);
}
var container = {
  a: Array
};
var realm = () => _globalThis;
var wrapper = [Array];
var key = 'from';
var slot = {
  of: x => [x, 'late']
};
const {
  a: {
    from: declaredFrom
  }
} = container;
const [{
  from: wrappedFrom
}] = wrapper;
const keyedFrom = _Array$from;
const [{
  of: slotOf
} = Array] = [slot];
const {
  Array: {
    from: calledFrom
  }
} = (realm(), {
  Array: {
    from: _Array$from
  }
});
export { r1, r2, r3, r4, r5, r6, declaredFrom, wrappedFrom, keyedFrom, slotOf, calledFrom };