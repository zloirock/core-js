'use strict';
// the injected module imports land after the prologue and block directive promotion
// themselves - a REPLACED entry needs no `0;` placeholder before the string literal
require('core-js/actual/array/from');
require('core-js/actual/array/at');
'not-a-directive';
foo();
