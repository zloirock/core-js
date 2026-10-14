import _DOMException from "@core-js/pure/actual/dom-exception/constructor";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A realm key's level nested in a parameter's pattern reads its slot through the parameter's default, as a
// declaration's reads it through the init: the parameter's default mirrors the constructor's statics, its whole
// index under a rest. A default nested in the pattern is the level's, not the parameter's: `Set.groupBy` is not
// what is read, and the level keeps its own default - a caller's object may lack the slot - save where the one
// caller hands the realm itself (`viaArgument`), whose slot is filled: the dead default leaves with the mirror.
export function group({
  Map: {
    groupBy
  } = _Set
} = {
  Map: {
    groupBy: _Map$groupBy
  }
}) {
  return groupBy;
}
export const attempt = ({
  Promise: {
    try: run
  } = _WeakMap
} = {
  Promise: {
    try: _Promise$try
  }
}) => run;
export class Pending {
  static make({
    Promise: {
      withResolvers
    } = _Iterator
  } = {
    Promise: {
      withResolvers: _Promise$withResolvers
    }
  }) {
    return withResolvers;
  }
}
const realm = _globalThis;
export function settle({
  Promise: {
    allSettled,
    race
  } = _WeakSet
} = {
  Promise: {
    allSettled: _Promise$allSettled,
    race: _Promise$race
  }
}) {
  return [allSettled, race];
}
export function nested({
  self: {
    Promise: {
      any
    } = _DOMException
  }
} = {
  self: {
    Promise: {
      any: _Promise$any
    }
  }
}) {
  return any;
}
export const viaArgument = function ({
  Promise: {
    reject
  }
}) {
  return reject;
}({
  Promise: {
    reject: _Promise$reject
  }
});
export function gathered({
  Promise: {
    all,
    ...others
  } = _URL
} = {
  Promise: _Promise
}) {
  return [all, others];
}
export function wrapped([{
  Promise: {
    resolve
  } = _Symbol
}] = [{
  Promise: {
    resolve: _Promise$resolve
  }
}]) {
  return resolve;
}