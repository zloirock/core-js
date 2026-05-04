// `'use strict';` directive ExpressionStatement leading the inline-callee body must NOT
// trigger SE-wrap. directives carry no observable runtime effect for SE purposes - they're
// metadata, not side effects. `hasObservableEffectsRec` filters directive Expressions out
// before counting, so a body of `'use strict'; return Promise;` still emits clean polyfill
const factory = () => { 'use strict'; return Promise; };
const out = factory().resolve(1);
export { out };
