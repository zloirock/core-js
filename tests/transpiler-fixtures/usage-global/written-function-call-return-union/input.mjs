// A function slot has writers returning different known families.
// Their calls need array and string includes, with no iterator variant.
const box = { fn: () => [8, 9] };
box.fn = () => "abcd";
use(box.fn().includes("bc"));
