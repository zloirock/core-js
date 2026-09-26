// Literal array spreads pair their elements at known positions.
// Each supported static receives its own pure value; unknown spreads keep uncertain slots native.
const [{ from: viaSole }] = [...[Array]];
const [, { of: viaShifted }] = [...[0, Array]];
const [[{ fromEntries: viaNested }]] = [...[[...[Object]]]];
const [{ at: viaInstance }] = [...[[1]]];
const [{ entries: viaSelecting }] = [...[c ? Object : userObj]];
// ... and through the transparent wrappers a source may spell around the spread array
const [{ groupBy: viaParens }] = [...([Object])];
const viaIifeParens = (([{ freeze: fr }]) => fr)(...([[c ? Object : userObj]]));
const viaIifeSwap = (({ hasOwn: ho }) => ho)(...([Object]));
// the argument a returning directive hands on is read at the same coordinate: `viaDirective` is the
// spread array's element, so its `.at` is the array's (the `seal` claim is the row's carrier)
const viaDirective = Object.seal(...([[1]]));
viaDirective.at(0);
export { viaSole, viaShifted, viaNested, viaInstance, viaSelecting, viaParens, viaIifeParens, viaIifeSwap, viaDirective };

// Nested literal spreads still pair exactly; binding spreads remain unknown.
// A hole spreads as `undefined` and supplies no static claim.
const [{ keys: viaAlias }] = [...wrapped];
const [{ values: viaDoubleSpread }] = [...[...[Object]]];
const [{ assign: viaHole }] = [...[, Object]];
const [{ at: viaHoleInstance }] = [...[, [1]]];
export { viaAlias, viaDoubleSpread, viaHole, viaHoleInstance };
