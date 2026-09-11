import _globalThis from "@core-js/pure/actual/global-this";
// the claimless call-rooted channel is anchored one member ABOVE the run's last proxy hop, the
// `delete` fold included: its base is the run's ROOT binding whatever plain members the source
// wrote between the run and the deleted slot - the identifier spelling's bytes, cell for cell
// NEGATIVE: a `?.` the source wrote over the run's own END decides whether the delete happens,
// so the channel stands down and every slot the run spells stays
const dh = () => _globalThis;
export const deletedRunEnd = delete _globalThis.customQ;
export const deletedPastOnePlainMember = delete _globalThis.a.customQ;
export const deletedPastTwoPlainMembers = delete _globalThis.a.b.customQ;
export const deletedProbeGuardStandsDown = delete dh().window?.customQ;