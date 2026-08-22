// The full-env pre-flight: the built bundle executed in a fresh node process, every native the
// polyfills would replace still in place. A process PER BUNDLE, because `mode: 'full'` patches globals
// permanently - in a shared one a cell's injection would mask another cell's miss.
export async function preflight(code, label) {
  const { stdout } = await $({ quiet: true, timeout: '120s', input: code })`node preflight-child.mjs`;
  if (!stdout.trim()) throw new Error(`${ label }: pre-flight produced no output - run() likely never settled`);
  try {
    return JSON.parse(stdout);
  } catch {
    throw new Error(`${ label }: pre-flight stdout is not JSON: ${ stdout.slice(0, 200) }`);
  }
}
