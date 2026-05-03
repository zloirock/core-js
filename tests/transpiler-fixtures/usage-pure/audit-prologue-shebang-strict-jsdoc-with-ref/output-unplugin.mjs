#!/usr/bin/env node
'use strict';
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
/**
 * @license MIT
 * Copyright (c) CoreJS Corp.
 */

// Full prologue: shebang + use-strict directive + JSDoc copyright. Injected polyfill
// imports must land after these and before user code; ref-only `var _refN` (used by
// optional-chain memoization) must reorder past the imports.
const x = obj == null ? void 0 : _flatMaybeArray(obj)?.call(obj);
const y = arr2 == null ? void 0 : _includes(arr2).call(arr2, 1);