import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// for-loop init with a nested proxy access that destructures multiple inner
// properties: each inner site must rewrite independently.
for (const from = _Array$from, of = _Array$of, i = 0; i < 1; i++) from([of(i)]);