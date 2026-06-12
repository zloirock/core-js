'use strict';

// the injected module imports land after the prologue and block directive promotion
// themselves - a REPLACED entry needs no `0;` placeholder before the string literal
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
'not-a-directive';
foo();