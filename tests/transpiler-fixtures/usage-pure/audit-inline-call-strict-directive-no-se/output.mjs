import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// a `'use strict';` directive ExpressionStatement leading the inline-callee body must NOT
// trigger SE-wrap. directives carry no observable runtime effect for SE purposes - they are
// metadata, not side effects, so they are filtered out before counting and a body of
// `'use strict'; return Promise;` still emits a clean polyfill
const factory = () => {
  'use strict';

  return _Promise;
};
const out = _Promise$resolve(1);
export { out };