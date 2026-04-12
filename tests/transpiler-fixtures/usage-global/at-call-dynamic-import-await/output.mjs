import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
const mod = await import("./module.js");
mod.default.at(-1);