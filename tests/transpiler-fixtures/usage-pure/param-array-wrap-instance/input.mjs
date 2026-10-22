// Instance leaves under array parameter levels capture their actual supplied receiver.
// Literal caller mirrors remain available where a sibling prevents moving the whole pattern.
const viaIife = (([{ at: viaIifeAt }]) => viaIifeAt)([[1, 2]]);
function viaDefault([{ flat: viaDefaultFlat }] = [[[1], [2]]]) { return viaDefaultFlat; }
const viaHopThenWrap = (({ w: [{ findLast: fl }] }) => fl)({ w: [[1, 2]] });
const viaDouble = (([[{ toReversed: tr }]]) => tr)([[[1, 2]]]);
const viaSibling = (([{ toSorted: ts }, other]) => [ts, other])([[2, 1], 0]);
const viaBinding = (([{ includes: inc }]) => inc)([arr]);
const viaSelecting = (([{ with: w }]) => w)([c ? [1] : [2]]);
export { viaIife, viaDefault, viaHopThenWrap, viaDouble, viaSibling, viaBinding, viaSelecting };

// An effectful element is evaluated once before its receiver is captured.
const viaEffect = (([{ flatMap: fm }]) => fm)([eff()]);
export { viaEffect };
