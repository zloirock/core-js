import _Reflect from "@core-js/pure/actual/reflect/namespace";
// An unused interpolation never leaves the tag. Its strings array is argument zero;
// the constructor remains narrow when the body does not read the next parameter.
function tag(strings, namespace) {}
tag`${_Reflect}`;