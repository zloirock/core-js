import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// an effectful computed key over a static claim runs where the source ran it on every host - an export, a
// declarator list behind a leading sibling, a default, a rest, a second key, a for, if or while head: the
// receiver's prefix runs first, then the key, then the sibling reads. a constructor exported through such a key
// takes its whole entry
let k = 0;
function pre() {}
function eff() {}
const first = 1,
  f = (k++, _Array$from),
  {
    m
  } = Array;
export { first, f, m };
const lead = pre(),
  ko = (eff(), k++, _Array$of),
  {
    alsoMore
  } = Array;
export { lead, ko, alsoMore };
var lead2 = pre(),
  ko2 = (k++, _Array$of),
  {
    m2
  } = Array;
var lead3 = pre(),
  P = (eff(), k++, _Map),
  {
    m3
  } = _globalThis;
var lead4 = pre(),
  ko4 = (k++, _Array$of),
  {
    "of": _unused,
    ...r4
  } = Array;
var lead5 = pre(),
  ko5 = (k++, _Array$of),
  fr5 = (k++, _Array$from),
  {
    m5
  } = Array;
for (var lead6 = pre(), ko6 = (eff(), k++, _Array$of), {
    m6
  } = Array; false;) break;
if (k) var lead7 = pre(),
  ko7 = (eff(), k++, _Array$of),
  {
    m7
  } = Array;
while (k < 0) var lead8 = pre(),
  ko8 = (k++, _Array$of),
  {
    m8
  } = Array;
export default [ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, lead2, lead3, lead4, lead5, lead6, lead7, lead8, k];