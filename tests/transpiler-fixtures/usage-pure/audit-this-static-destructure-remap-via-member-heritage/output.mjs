import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
const ns = {
  Promise: _Promise
};
class MemberHeritage extends ns.Promise {
  static m() {
    const t = _Promise$try;
    return t;
  }
}
export const viaMemberHeritage = MemberHeritage.m();