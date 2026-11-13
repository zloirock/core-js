export function settingsFrom(env) {
  const manifestPath = env.CORE_JS_MANIFEST_PATH;
  const host = env.HOST === undefined ? '0.0.0.0' : env.HOST;
  const portValue = env.PORT === undefined ? '3000' : env.PORT;

  if (typeof manifestPath !== 'string' || !manifestPath) {
    throw new TypeError('CORE_JS_MANIFEST_PATH must be a nonempty string');
  }
  if (typeof host !== 'string' || !host) {
    throw new TypeError('HOST must be a nonempty string');
  }
  if (typeof portValue !== 'string' || !/^[1-9]\d*$/.test(portValue) || Number(portValue) > 65535) {
    throw new TypeError('PORT must be a decimal integer from 1 to 65535');
  }

  return { manifestPath, host, port: Number(portValue) };
}
