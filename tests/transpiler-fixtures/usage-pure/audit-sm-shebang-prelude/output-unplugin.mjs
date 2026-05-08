#!/usr/bin/env node
import _Array$from from "@core-js/pure/actual/array/from";
import _entries from "@core-js/pure/actual/instance/entries";
import _Map from "@core-js/pure/actual/map/constructor";
// shebang as the only prelude line, followed by polyfill-triggering statements.
// imports must land after the shebang, never before it (would break OS exec contract)
_Array$from([1, 2, 3]);
_entries(_Map).call(_Map);