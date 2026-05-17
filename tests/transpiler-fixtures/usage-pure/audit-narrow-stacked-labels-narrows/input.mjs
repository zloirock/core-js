// stacked LabeledStatements: `outer: inner: { x = "hello"; }` - walker passes through
// both label layers (passthrough set includes LabeledStatement). asserts the passthrough
// classification doesn't only handle single labels - nested labels are also transparent
let x = [1, 2, 3];
outer: inner: { x = "hello"; }
x.at(0);
