// A level default holding a selection of containers reads the slot of the arm that runs where it fires:
// a selection the build decides mirrors its live arm alone, an undecided one mirrors every arm - under an
// object level, an array level and an element default alike.
const { W: { C: { groupBy: viaDecided } } = typeof Symbol != 'undefined' ? { C: Map } : { C: Object } } = {};
const { V: { C: { from: viaUndecided } } = c ? { C: Array } : { C: Iterator } } = {};
const { U: { C: { allSettled: viaFreshLeft } } = { C: Promise } || { C: Object } } = {};
const { T: [{ hasOwn: viaArrayLevel }] = typeof Symbol != 'undefined' ? [Object] : [Reflect] } = {};
const [{ C: { of: viaElement } } = typeof Symbol != 'undefined' ? { C: Array } : { C: Object }] = [];
export { viaDecided, viaUndecided, viaFreshLeft, viaArrayLevel, viaElement };
