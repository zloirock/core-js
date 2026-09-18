import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
// An effect before a literal iterable does not make a local head escape.
// The body reads only an intrinsic property, so Map stays on its narrow constructor entry.
for (const value of (effect(), [_Map])) void _nameMaybeFunction(value);