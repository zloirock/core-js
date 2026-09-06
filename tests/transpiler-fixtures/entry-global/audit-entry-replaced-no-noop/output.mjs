'use strict';

// the injected module imports land after the prologue and block directive promotion
// themselves - a REPLACED entry needs no `0;` placeholder before the string literal
require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.at");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");
'not-a-directive';
foo();