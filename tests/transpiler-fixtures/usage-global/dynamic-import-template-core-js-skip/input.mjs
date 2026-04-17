async function load(mod) {
  const lib = await import(`core-js/${mod}`);
  return Array.from(lib);
}
