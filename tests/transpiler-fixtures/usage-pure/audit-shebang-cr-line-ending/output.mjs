#!/usr/bin/env node
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var a = [1];
_atMaybeArray(a).call(a, 0);