var _flatMaybeArray = require("@core-js/pure/actual/array/instance/flat");
var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _ref, _ref2;
// guarded `module?.exports` read with subsequent CJS write - the OptionalMember chain
// covers tooling that emits `module?.exports` for environments without a guaranteed
// `module` global (UMD bundles). CJS detection walks both MemberExpression and
// OptionalMemberExpression rooted at module/exports so the file is correctly classified
const guard = module?.exports;
module.exports.bar = _flatMaybeArray(_ref = [1, 2, 3]).call(_ref);
module.exports.baz = _atMaybeArray(_ref2 = ['a', 'b']).call(_ref2, 0);
console.log(guard);