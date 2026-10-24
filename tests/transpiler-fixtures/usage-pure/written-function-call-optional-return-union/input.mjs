// An optional call to an own function returns an array or a string.
// Its result needs both includes families, with no iterator variant.
const box = {};
box.map = () => flag ? [1] : "ab";
use(box.map?.().includes(1));
