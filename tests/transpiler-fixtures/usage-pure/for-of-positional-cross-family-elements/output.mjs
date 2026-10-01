import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// The same position may hold different receiver families on different iterations.
// Neither a first element nor a later matching element can narrow that position.
for (const _ref3 of [[[1], '02'], ['02', [1]], [[2], '12']]) {
  const [_ref, _ref2] = _ref3;
  const at = _at(_ref);
  const includes = _includes(_ref2);
  use(at, includes);
}