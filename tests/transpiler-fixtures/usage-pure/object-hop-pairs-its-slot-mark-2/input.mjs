const viaSeqArg = (({ at: m }) => m)((mark(), [1, 2]));
function mark() {}
export default [viaSeqArg];
