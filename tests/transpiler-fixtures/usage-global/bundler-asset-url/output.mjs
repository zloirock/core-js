import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url-search-params.constructor";
// Keep the constructor spelling by which bundlers discover assets and workers.
export const asset = new URL('./logo.svg', import.meta.url);
export const template = new URL(`./logo.svg`, import.meta.url);
const name = 'logo';
export const selected = new URL(`./${name}.svg`, import.meta.url);
export const worker = new Worker(new URL('./worker.js', import.meta.url));