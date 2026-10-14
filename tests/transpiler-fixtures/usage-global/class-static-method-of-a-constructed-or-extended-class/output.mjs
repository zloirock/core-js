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
// a class this file also constructs or extends keeps its statics' callers where the file sees every one: an
// instance reaches the statics only through a `constructor` read, which this file never spells, and a subclass
// calls them as its own. a class handed out pairs nothing: its callers outside pass whatever they pass
class Lists {
  static fromText(C, text) {
    return new Lists(C.from(text));
  }
  constructor(items) {
    this.items = items;
  }
}
class Base {
  static cut(M, value) {
    return M.trunc(value);
  }
}
class Derived extends Base {}
class Shared {
  static plain(S, strings) {
    return S.raw(strings);
  }
}
hand(Shared);
export const list = Lists.fromText(Array, 'ab');
export const cut = Derived.cut(Math, 1.5);
export const tag = Shared.plain(String, {
  raw: ['a']
});