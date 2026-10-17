// the reassignment DOMINATES the capture - the init is dead, so nothing folds
let deadRoot = Array;
deadRoot = Object;
const deadLink = deadRoot;
export function viaDominatingReassign(deadRoot) {
  const {
    from
  } = deadLink;
  return from([1]);
}