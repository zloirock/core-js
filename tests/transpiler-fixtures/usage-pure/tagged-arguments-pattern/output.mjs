import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A named tag destructures only ownKeys from its known Reflect argument.
// Preserve the strings-array offset and inject that static without the other methods.
function tag(strings, {
  ownKeys
}) {
  return ownKeys({
    value: 1
  });
}
tag`${{
  ownKeys: _Reflect$ownKeys
}}`;