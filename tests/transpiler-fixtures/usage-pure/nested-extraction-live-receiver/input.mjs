// A delayed receiver follows its rewritten child in every assignment host.
let method;
const rows = [4, 9];
({ y: { at: method } } = { y: (observe(), Array.from([4, 9])) });
if (enabled) ({ y: { at: method } } = { y: (observe(), Array.from([4, 9])) });
(before(), ({ y: { at: method } } = { y: (observe(), Array.from([4, 9])) }), after());
({ y: { at: method } } = { y: rows.flat() });
