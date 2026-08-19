// a function body with a `;`-less directive prologue, nested inside an instance memo (the IIFE
// stands in the memoized array / argument): the body's scoped `var` cannot be a plain insert there
// (it would split the enclosing overwrite) and rides the owner's content instead - and it has to
// open its own line exactly like the plain insert does, or `'use strict' var _ref2;` is a parse error
export const inArray = [(function () {
  'use strict'
  return [1].at(0)
})()].at(0);
export const inArgument = [1].at((() => { 'use strict'
 return [2].at(0) })());
export const inOptional = arr?.at((() => { 'use strict'
 return [3].at(0) })());
