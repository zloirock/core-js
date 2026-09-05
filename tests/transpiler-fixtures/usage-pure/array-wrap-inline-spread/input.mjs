// an INLINE-array spread in a wrapper literal is a longer literal: the pairing reads its items at
// their static positions, and the rewrite splices them into the level before any route edits it by
// slot. one static per row, so a row's extraction is attributable to its own shape
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

// NEGATIVES: a spread of a BINDING and a spread nested inside the spread array have no static
// length; a hole spreads as `undefined`, which binds no claim - the literal stays as written
const [{ keys: viaAlias }] = [...wrapped];
const [{ values: viaDoubleSpread }] = [...[...[Object]]];
const [{ assign: viaHole }] = [...[, Object]];
const [{ at: viaHoleInstance }] = [...[, [1]]];
export { viaAlias, viaDoubleSpread, viaHole, viaHoleInstance };
