import _Map from "@core-js/pure/actual/map";
// Iterable effects run before the body without hiding the value that reaches the head.
// An escaping loop binding still carries the substituted constructor with its statics.
for (const value of (effect(), [_Map])) hand(value);