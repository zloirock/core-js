import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// two adjacent rewrite sites with identical source text: the rewriter must emit two
// distinct replacements at the right offsets, not collapse them.
_includes(obj).call(obj, _at(a).call(a, 0));
_includes(obj).call(obj, _at(a).call(a, 0));