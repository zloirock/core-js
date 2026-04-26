// `for (obj.member of iter)` LHS member-assignment: the LHS member is a write target,
// not a polyfill site, and must be left as-is.
for (obj.at of items) {}
for (obj.includes in items) {}