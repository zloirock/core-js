import _includes from "@core-js/pure/actual/instance/includes";
// destructure with default value inside an arrow expression body: the temporary
// ref binding is hoisted to the arrow's local scope (not module-level) so the rewrite
// remains valid when the arrow is evaluated multiple times
const f = () => {
  var _ref;
  const includes = (_ref = _includes(getArr())) === void 0 ? fallback : _ref;
  return includes;
};