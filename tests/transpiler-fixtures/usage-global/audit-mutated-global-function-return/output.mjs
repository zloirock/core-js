import "core-js/modules/es.object.to-string";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
import "core-js/modules/web.dom-exception.constructor";
import "core-js/modules/web.dom-exception.stack";
import "core-js/modules/web.dom-exception.to-string-tag";
import "core-js/modules/web.atob";
// a replaced global returns whatever the patch returns, so the known narrow drops to the
// generic dispatch - the same trust gate the static-registry arms already apply
globalThis.atob = (() => [1, 2]) as any;
atob('x').at(0);
parseFloat('1.5').toFixed(1);