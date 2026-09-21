import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A finite loop element remains a static receiver through its binding and literal spreads.
// Member and destructured reads need their named static, without a whole namespace escape.
for (const ctor of [Array]) ctor.of(1);
for (const ctor of [...[Object]]) {
  const {
    hasOwn
  } = ctor;
  use(hasOwn({}, 'x'));
}
for (const [ctor] of [...[[Promise]]]) ctor.withResolvers();