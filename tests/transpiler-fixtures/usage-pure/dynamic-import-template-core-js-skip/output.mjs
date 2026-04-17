import _Array$from from "@core-js/pure/actual/array/from";
async function load(mod) {
  const lib = await import(`core-js/${mod}`);
  return _Array$from(lib);
}