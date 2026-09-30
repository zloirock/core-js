// A container binding reassigned after a member read must retain that read's runtime value.
const letReassignedAfterRead = (function () {
  let reassignedHolder = { k: Object };
  const out = reassignedHolder.k.freeze({});
  reassignedHolder = null;
  return out;
})();
export { letReassignedAfterRead };
