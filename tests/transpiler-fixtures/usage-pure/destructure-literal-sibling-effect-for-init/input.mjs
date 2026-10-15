// An observable sibling in a literal finishes before the loop's instance read.
let effects = 0;
for (var { y: { includes } } = { y: [1, 2], z: effects++ }; !includes;) break;
