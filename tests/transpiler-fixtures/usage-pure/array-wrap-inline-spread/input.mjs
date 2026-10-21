// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const [{ from: viaSole }] = [...[Array]];
const [, { of: viaShifted }] = [...[0, Array]];
const [[{ fromEntries: viaNested }]] = [...[[...[Object]]]];
const [{ at: viaInstance }] = [...[[1]]];
const [{ entries: viaSelecting }] = [...[c ? Object : userObj]];
const [{ groupBy: viaParens }] = [...([Object])];
const viaIifeParens = (([{ freeze: fr }]) => fr)(...([[c ? Object : userObj]]));
const viaIifeSwap = (({ hasOwn: ho }) => ho)(...([Object]));
const viaDirective = Object.seal(...([[1]]));
viaDirective.at(0);
export { viaSole, viaShifted, viaNested, viaInstance, viaSelecting, viaParens, viaIifeParens, viaIifeSwap, viaDirective };

const [{ keys: viaAlias }] = [...wrapped];
const [{ values: viaDoubleSpread }] = [...[...[Object]]];
const [{ assign: viaHole }] = [...[, Object]];
const [{ at: viaHoleInstance }] = [...[, [1]]];
export { viaAlias, viaDoubleSpread, viaHole, viaHoleInstance };
