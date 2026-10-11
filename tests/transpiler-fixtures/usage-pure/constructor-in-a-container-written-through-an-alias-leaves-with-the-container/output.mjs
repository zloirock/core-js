import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _URL from "@core-js/pure/actual/url/constructor";
// a container written through an alias that is no plain one carries the constructors it holds into the slot it
// lands on: handed out with the container that slot belongs to, each keeps its statics - in usage-global its
// family - through an arm of a selection and a member path alike, and so does one read back through the slot; a
// container no one hands out or reads back hands out none
const first = {};
const spare = {};
const via = flag ? first : spare;
via.C = {
  D: _Map
};
use(first);
const second = {
  inner: {}
};
const member = second.inner;
member.C = {
  D: _Promise
};
use(second);
const third = {};
const either = opener || third;
either.C = {
  D: _Iterator
};
export const wrapped = third.C.D.from([1]);
const fourth = {};
const kept = {};
const plain = flag ? fourth : kept;
plain.C = {
  D: _URL
};