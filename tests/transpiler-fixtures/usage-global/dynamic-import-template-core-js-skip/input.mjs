// dynamic `import(`core-js/${mod}`)` is treated as user runtime, not as a direct core-js entry;
// surrounding async function still requires Promise + iterator polyfills for the await + Array.from
async function load(mod) {
  const lib = await import(`core-js/${mod}`);
  return Array.from(lib);
}
