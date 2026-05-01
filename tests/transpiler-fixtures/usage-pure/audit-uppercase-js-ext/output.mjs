import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// Windows filesystems and some bundler stages emit upper-case extensions. The
// transformInclude gate accepts case-insensitively, and plain JS content parses cleanly
// regardless of suffix case (parser falls back to plain JS on unknown extension).
_flatMaybeArray(arr)?.call(arr);
_padStartMaybeString(str).call(str, 8);