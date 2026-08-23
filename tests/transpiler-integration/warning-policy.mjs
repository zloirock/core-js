// Both bundler suites escalate the same way, because it is the same failure of the same plugins: an
// injected specifier a tool cannot resolve becomes an external import, and everything downstream then
// asserts against a bundle the polyfill never reached. `PLUGIN_WARNING` is unplugin's own channel.
const FATAL_WARNINGS = new Set(['UNRESOLVED_IMPORT', 'MISSING_EXPORT']);

export function makeStrictWarn(unpluginName) {
  return function strictWarn(warning, warn) {
    if (FATAL_WARNINGS.has(warning.code)) throw new Error(`${ warning.code }: ${ warning.message }`);
    if (warning.code === 'PLUGIN_WARNING' && warning.plugin?.startsWith(unpluginName)) {
      throw new Error(`${ warning.plugin }: ${ warning.message }`);
    }
    warn(warning);
  };
}
