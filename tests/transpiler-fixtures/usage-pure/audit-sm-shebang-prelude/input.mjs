#!/usr/bin/env node
// shebang as the only prelude line, followed by polyfill-triggering statements.
// imports must land after the shebang, never before it (would break OS exec contract)
Array.from([1, 2, 3]);
Map.entries();
