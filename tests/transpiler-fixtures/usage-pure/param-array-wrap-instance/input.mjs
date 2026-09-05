// an INSTANCE leaf under an ARRAY wrapper of a parameter pattern takes the hop-instance mirror the
// object-hop twin takes: the element the wrapper pairs with is the receiver, and the synth literal
// lands IN that element - the parameter's own default, or the IIFE argument. one method per row
const viaIife = (([{ at: viaIifeAt }]) => viaIifeAt)([[1, 2]]);
function viaDefault([{ flat: viaDefaultFlat }] = [[[1], [2]]]) { return viaDefaultFlat; }
const viaHopThenWrap = (({ w: [{ findLast: fl }] }) => fl)({ w: [[1, 2]] });
const viaDouble = (([[{ toReversed: tr }]]) => tr)([[[1, 2]]]);
const viaSibling = (([{ toSorted: ts }, other]) => [ts, other])([[2, 1], 0]);
const viaBinding = (([{ includes: inc }]) => inc)([arr]);
const viaSelecting = (([{ with: w }]) => w)([c ? [1] : [2]]);
export { viaIife, viaDefault, viaHopThenWrap, viaDouble, viaSibling, viaBinding, viaSelecting };

// NEGATIVE: an element that RUNS is read once natively - a mirror would spell it a second time
const viaEffect = (([{ flatMap: fm }]) => fm)([eff()]);
export { viaEffect };
