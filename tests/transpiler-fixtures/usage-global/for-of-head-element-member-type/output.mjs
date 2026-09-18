import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.entries";
// a for-x HEAD binds an ELEMENT of what the loop iterates, which no init can spell. A literal whose
// elements agree names one value to every read through the binding, so a member read resolves exactly
// as the same literal under a plain `const` does - the typed family alone, or none at all where the
// slot holds a function. A NAMED element is reached through its own declaration and keeps the generic
// read, and so does a longer literal whose elements disagree.
// one method per row: they share no module, so no row's families can hide another's
for (const el of [{
  y: [1, 2]
}]) el.y.at(0);
for (const fn of [{
  w() {
    return 1;
  }
}]) fn.w.flat();
for (const named of [box]) named.y.includes(1);
for (const disagree of [{
  y: [1, 2]
}, {
  y: 'str'
}]) disagree.y.entries();