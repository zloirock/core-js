import _Array$from from "@core-js/pure/actual/array/from";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// a name bound to an owner whole (`const Alias = Owner`) calls the owner's own methods: a call through it
// pairs its arguments as the owner's own spelling does, a literal's method and a class's static alike,
// through every link of the chain - and whatever opens the alias, handing it out, opens the owner too
const Helpers = {
  fromText(C, text) {
    return _Array$from(text);
  }
};
const Short = Helpers;
class Numbers {
  static cut(M, value) {
    return _Math$trunc(value);
  }
}
const Num = Numbers;
const Again = Num;
class Opened {
  static plain(S, strings) {
    return S.raw(strings);
  }
}
const Shared = Opened;
hand(Shared);
export const list = Short.fromText(Array, 'ab');
export const cut = Again.cut(Math, 1.5);
export const tag = Opened.plain(String, {
  raw: ['a']
});