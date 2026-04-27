// debug factory: when `debug: true` option is set, returns a per-file debug-output
// collector factory. each plugin invocation calls the factory once per file so concurrent
// transforms (Vite parallel workers, etc.) get isolated state. the collector accumulates
// added modules + warnings + entryFound flag and renders a human-readable report at file end
import { sortByPolyfillOrder } from './inject.js';
import { formatTargets, getUnsupportedTargets } from './targets.js';

const { fromEntries } = Object;

// returns a factory: each call creates an isolated per-file debug collector
// safe for concurrent transforms (e.g. Vite parallel file processing).
// `targetsStr` snapshot at factory creation time is intentional - `parsedTargets` is
// derived once from the user's options and never mutates afterwards
export function createDebugOutputFactory({ method, parsedTargets }) {
  const targetsStr = parsedTargets
    ? JSON.stringify(fromEntries([...parsedTargets].map(([e, v]) => [e, String(v)])), null, 2)
    : '{}';

  return function createFileDebugOutput() {
    const modules = new Set();
    const warnings = new Set();
    let entryFound = false;

    return {
      add(mod) {
        modules.add(mod);
      },
      warn(message) {
        warnings.add(message);
      },
      markEntryFound() {
        entryFound = true;
      },
      format() {
        // sort to match the canonical polyfill emission order (es.* before web.*, etc.)
        // so debug output is reproducible across files / parser orders / detection cadence.
        // insertion order would surface visitor traversal noise that's not user-meaningful
        const items = sortByPolyfillOrder([...modules]);
        let result;
        if (method === 'entry-global' && !entryFound) {
          result = 'The entry point for the core-js@4 polyfill has not been found.';
        } else if (items.length === 0) {
          const scope = method === 'entry-global' ? 'your targets' : 'your code and targets';
          result = `Based on ${ scope }, the core-js@4 polyfill did not add any polyfill.`;
        } else {
          const verb = method === 'entry-global' ? 'entry has been replaced with' : 'added';
          const polyfillLines = items.map(mod => method === 'usage-pure'
            ? `  ${ mod }`
            : `  ${ mod } ${ formatTargets(getUnsupportedTargets(mod, parsedTargets)) }`);
          result = `The core-js@4 polyfill ${ verb } the following polyfills:\n${ polyfillLines.join('\n') }`;
        }
        const warningBlock = warnings.size
          ? `\n\nWarnings:\n${ [...warnings].map(m => `  ${ m }`).join('\n') }` : '';
        return `core-js@4: \`DEBUG\` option\n\nUsing targets: ${ targetsStr }\n\nUsing polyfills with \`${ method }\` method:\n${ result }${ warningBlock }`;
      },
    };
  };
}
