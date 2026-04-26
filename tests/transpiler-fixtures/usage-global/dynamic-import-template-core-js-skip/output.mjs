import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// dynamic `import(`core-js/${mod}`)` is treated as user runtime, not as a direct core-js entry;
// surrounding async function still requires Promise + iterator polyfills for the await + Array.from
async function load(mod) {
  const lib = await import(`core-js/${mod}`);
  return Array.from(lib);
}