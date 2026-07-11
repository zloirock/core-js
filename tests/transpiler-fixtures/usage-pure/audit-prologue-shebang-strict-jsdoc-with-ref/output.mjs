#!/usr/bin/env node
'use strict';

/**
 * @license MIT
 * Copyright (c) CoreJS Corp.
 */

// Full prologue: shebang + use-strict directive + JSDoc copyright. Injected polyfill
// imports must land after these and before user code. the call-rooted base MINTS a
// memo `var _ref` that must reorder past the imports (a plain-identifier base guards
// with `== null` and mints nothing - the second line keeps that negative visible)
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
const x = null == (_ref = getObj()) ? void 0 : _flatMaybeArray(_ref)?.call(_ref);
const y = arr2 == null ? void 0 : _includes(arr2).call(arr2, 1);