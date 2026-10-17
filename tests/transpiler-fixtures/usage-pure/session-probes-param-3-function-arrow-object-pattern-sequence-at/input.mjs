{
function mark() {} const viaSeqArg = (({ at: m }) => m)((mark(), [1, 2])); use(viaSeqArg);
}
