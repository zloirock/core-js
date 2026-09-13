import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _self from "@core-js/pure/actual/self";
// In pure, a plain proxy run landing on a backed leaf has the same value when written inline,
// held in an alias, or extracted from a container. An optional above that stored value
// is redundant in every spelling. A source optional inside the run and a terminal
// environment probe keep their guards and the stored undefined value.
let inlineStored, aliasStored, extractedStored, optionalStored, terminalStored;
export const inline = (inlineStored = _self, _Array$of)(1);
const alias = _self;
export const aliased = (aliasStored = alias, _Object$entries)({
  a: 2
});
const [extracted] = [_self];
export const destructured = (extractedStored = extracted, _Math$hypot)(3, 4);
export const optional = null == (optionalStored = null == _globalThis.window ? void 0 : _self) ? void 0 : _Array$from([5]);
export const terminal = null == (terminalStored = _self.window) ? void 0 : _Object$fromEntries([['b', 6]]);
export { inlineStored, aliasStored, extractedStored, optionalStored, terminalStored };