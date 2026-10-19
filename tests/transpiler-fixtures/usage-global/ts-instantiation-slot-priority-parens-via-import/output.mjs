import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaImport = import('m')<string>(1);