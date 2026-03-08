import "core-js/modules/es.object.freeze";
let x = {};
Object.freeze(x ||= {});