// LabeledStatement-wrapped block in straight-line position: `outer: { x = "hello"; }`
// is forward-transparent (the label only matters when a labeled `break`/`continue`
// targets it, which would be caught by the preceding-sibling exit scan). the reachability
// walk accepts LabeledStatement as a transparent wrapper alongside BlockStatement / Program
let x = [1, 2, 3];
outer: { x = "hello"; }
x.at(0);
