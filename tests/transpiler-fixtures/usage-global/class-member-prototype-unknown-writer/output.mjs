import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
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
// A written static slot or escaping class cannot retain its initializer constructor proof.
// Instance reads through prototype keep the generic helpers.
class Written {
  static C = Array;
}
Written.C = other;
use(Written.C.prototype.at);
class Escaped {
  static get C() {
    return String;
  }
}
mutate(Escaped);
use(Escaped.C.prototype.includes);