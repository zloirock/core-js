import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a logical assignment stores over an unset binding only when its operator can: `??=` and `||=`
// write the literal, so a deferred destructure of the binding reads the slot's constructor; `&&=`
// never writes over undefined, so the binding still holds nothing and its read stays raw
let viaNullish;
viaNullish ??= {
  u: _Map
};
let viaOr;
viaOr ||= {
  u: _Promise
};
let viaAnd;
viaAnd &&= {
  u: _Iterator
};
export const nullish = () => {
  const groupBy = _Map$groupBy;
  return groupBy;
};
export const or = () => {
  const attempt = _Promise$try;
  return attempt;
};
export const and = () => {
  const {
    u: {
      from
    }
  } = viaAnd;
  return from;
};