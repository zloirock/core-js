import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
// a tagged template yields what its tag returns, so a static read off a slot holding one names
// the constructor the tag returns and is served by that static's own entry
function iterator() {
  return _Iterator;
}
function promise() {
  return _Promise;
}
function url() {
  return _URL;
}
const list = [iterator`x`];
export const from = typeof _Iterator$from;
export const attempted = (promise`y`, _Promise$try)(() => 1);
const box = {
  U: url`z`
};
export const parses = _URL$canParse('a:b');