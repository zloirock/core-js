import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A dynamic key may overwrite any field. Literal and template keys can only overwrite their named field.
class Dynamic {
  a = [1, 2, 3];
  dyn(key) {
    this[key] = "x";
    return this.a.at(0);
  }
}
class Literal {
  b = [4, 5, 6];
  lit() {
    this["b"] = "x";
    return this.b.includes("x");
  }
}
class Template {
  c = [7, 8, 9];
  tpl() {
    this[`c`] = "x";
    return this.c.at(0);
  }
}
class Static {
  items = [1, 2, 3];
  read() {
    return this.items.at(0);
  }
}
const d = new Dynamic();
export const x = [d.dyn(0), d.dyn("a")];
export const y = new Literal().lit();
export const z = new Template().tpl();
export const kept = new Static().read();