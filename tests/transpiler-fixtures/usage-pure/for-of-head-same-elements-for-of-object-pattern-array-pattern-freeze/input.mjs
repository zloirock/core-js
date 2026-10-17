// Different values, keys, spreads and holes refuse a single-receiver mirror; a GETTER element reads
// through its own body, whose one returned leaf the mirror rewrites in place (the getter still runs).
// Enumerable static candidates may still receive a guard; unknown receivers stay native.
for (const { w: [{ freeze: viaOtherValue }] } of [{ w: [Object] }, { w: [userObj] }]) viaOtherValue;
