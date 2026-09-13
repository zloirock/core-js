// A named destructuring parameter has no default receiver. Known callers supply the static
// through the argument mirror; custom objects and absent properties keep their own values.
// Only from is consumed, so the other callers do not require the full Array namespace.
function read({ from }) { return from; }
read(Array)([1, 2]);
read({ from: value => value })(3);
read({});
