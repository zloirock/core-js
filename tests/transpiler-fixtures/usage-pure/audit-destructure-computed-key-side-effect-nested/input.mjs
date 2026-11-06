// A nested computed static key runs once after receiver capture and before binding.
// Both the from leaf and the independent flat call retain their polyfills.
const { x: { [(effectful(), "from")]: f } } = { x: Array };
const doubled = [1, [2]].flat();
