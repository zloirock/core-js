// A paired literal exposes the nested instance receiver without another capture.
// The ordinary sibling retains its native write and the dispatch reads arr once.
const arr = [1, [2]];
let m;
let z;
({ y: { flat: m }, z } = { y: arr, z: 9 });
