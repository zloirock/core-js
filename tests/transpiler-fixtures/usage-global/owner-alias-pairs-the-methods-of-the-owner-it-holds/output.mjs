import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.from";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.code-point-at";
import "core-js/modules/es.string.ends-with";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.is-well-formed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.match";
import "core-js/modules/es.string.match-all";
import "core-js/modules/es.string.raw";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.replace-all";
import "core-js/modules/es.string.search";
import "core-js/modules/es.string.split";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/es.string.trim";
import "core-js/modules/es.string.trim-end";
import "core-js/modules/es.string.trim-left";
import "core-js/modules/es.string.trim-right";
import "core-js/modules/es.string.trim-start";
import "core-js/modules/es.string.anchor";
import "core-js/modules/es.string.big";
import "core-js/modules/es.string.blink";
import "core-js/modules/es.string.bold";
import "core-js/modules/es.string.fixed";
import "core-js/modules/es.string.fontcolor";
import "core-js/modules/es.string.fontsize";
import "core-js/modules/es.string.italics";
import "core-js/modules/es.string.link";
import "core-js/modules/es.string.small";
import "core-js/modules/es.string.strike";
import "core-js/modules/es.string.sub";
import "core-js/modules/es.string.sup";
// a name bound to an owner whole (`const Alias = Owner`) calls the owner's own methods: a call through it
// pairs its arguments as the owner's own spelling does, a literal's method and a class's static alike,
// through every link of the chain - and whatever opens the alias, handing it out, opens the owner too
const Helpers = {
  fromText(C, text) {
    return C.from(text);
  }
};
const Short = Helpers;
class Numbers {
  static cut(M, value) {
    return M.trunc(value);
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