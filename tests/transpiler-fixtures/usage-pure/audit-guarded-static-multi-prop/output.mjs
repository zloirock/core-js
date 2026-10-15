import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2, _ref3;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// a binding that MAY be a constructor takes the identity guard, and a pattern reading several of its
// statics splits into one read per prop, in source order - each with its own guard. a prop this plan
// cannot answer stays in the ORIGINAL pattern node (a spliced one would depend on a later visit, which
// only one leg makes), and only the claims at the pattern's EDGE detach, so source order holds
let M = pickConstructor();
if (!M) M = Array;
const from = M === Array ? _Array$from : M.from,
  of = M === Array ? _Array$of : M.of;
// ... the claim's own position in the pattern decides nothing - the reads keep source order
const of2 = M === Array ? _Array$of : M.of,
  from2 = M === Array ? _Array$from : M.from;
// a plain data key stays in the pattern, the claims ahead of it detach
const from3 = M === Array ? _Array$from : M.from,
  of3 = M === Array ? _Array$of : M.of,
  {
    isArray
  } = M;
const {
  from: from4,
  ...rest
} = M;
// Defaults keep their user fallback, and known computed keys share the guarded static read.
const from5 = (_ref = M, _ref === Array ? _Array$from : _ref.from),
  of5 = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? 1 : _ref2;
const dyn = 'of';
const from6 = (_ref3 = M, _ref3 === Array ? _Array$from : _ref3.from),
  of6 = _ref3 === Array ? _Array$of : _ref3.of;
// the ASSIGNMENT host splits too, where its value is nobody's - a statement of its own
let a, b;
a = M === Array ? _Array$from : M.from, b = M === Array ? _Array$of : M.of;
export { from, of, of2, from2, from3, of3, isArray, from4, rest, from5, of5, from6, of6, a, b };