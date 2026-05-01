#!/usr/bin/env node
// CLI entry: shebang as the first line. oxc-parser accepts shebang directly. Output keeps
// shebang in place; injected polyfill imports land after the shebang prologue (and any
// directive prologue), not before it (which would break the OS exec contract).
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
_flatMaybeArray(arr)?.call(arr);
_padStartMaybeString(str).call(str, 8);