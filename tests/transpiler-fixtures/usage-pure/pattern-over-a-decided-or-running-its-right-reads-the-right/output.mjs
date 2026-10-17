import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _String$raw from "@core-js/pure/actual/string/raw";
// a `||` whose test the build decides false runs its right, and a pattern reads through it as through
// that right spelled alone, as through the `&&` twin whose test holds: declared, assigned, as a parameter
// default, in a for-of head, beside a rest or an effectful key, for an instance method - a parameter's own
// default among them - and where the test is an `&&` whose own test fails
export const {
  C: {
    groupBy
  }
} = {
  C: {
    groupBy: _Map$groupBy
  }
};
let fromAsync;
({
  C: {
    fromAsync
  }
} = {
  C: {
    fromAsync: _Array$fromAsync
  }
});
export function viaParam({
  C: {
    withResolvers
  }
} = {
  C: {
    withResolvers: _Promise$withResolvers
  }
}) {
  return withResolvers;
}
for (const {
  C: {
    fromEntries
  }
} of [{
  C: {
    fromEntries: _Object$fromEntries
  }
}]) console.log(fromEntries);
export const {
  C: {
    ownKeys
  },
  ...rest
} = {
  C: {
    ownKeys: _Reflect$ownKeys
  },
  D: 1
};
export const {
  [(console.log(), 'C')]: {
    raw
  }
} = {
  C: {
    raw: _String$raw
  }
};
export const at = _atMaybeArray([1, 2]);
export function instanceViaParam(_ref = [1, 2]) {
  let last = _at(_ref);
  return last;
}
export const {
  C: {
    hasOwn
  }
} = {
  C: {
    hasOwn: _Object$hasOwn
  }
};
export { fromAsync };