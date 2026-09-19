// `require(('core-js/...' as any))` - combined ParenthesizedExpression + TS cast around the
// string argument. shared adapter unwrap alternates paren / TS peel layers so the inner
// string literal still reaches the entry-detection check regardless of wrapper order
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.reflect.own-keys");
require("core-js/modules/es.aggregate-error.constructor");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.promise.reject");
require("core-js/modules/es.promise.resolve");
require("core-js/modules/es.promise.all");
require("core-js/modules/es.promise.all-settled");
require("core-js/modules/es.promise.any");
require("core-js/modules/es.promise.race");
require("core-js/modules/es.promise.try");
require("core-js/modules/es.promise.with-resolvers");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.string.iterator");
require("core-js/modules/esnext.promise.all-keyed");
require("core-js/modules/esnext.promise.all-settled-keyed");
require("core-js/modules/web.dom-collections.iterator");