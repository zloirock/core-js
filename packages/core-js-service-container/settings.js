import { join } from 'node:path';

export function settingsFrom(env) {
  const manifestPath = env.CORE_JS_MANIFEST_PATH;
  const cacheRoot = env.CORE_JS_CACHE_DIR;
  const imageDigest = env.CORE_JS_IMAGE_DIGEST;
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

  let cacheDirectory = null;
  if (cacheRoot !== undefined) {
    if (typeof cacheRoot !== 'string' || !cacheRoot) {
      throw new TypeError('CORE_JS_CACHE_DIR must be a nonempty string');
    }
    if (typeof imageDigest !== 'string' || !/^sha256:[\da-f]{64}$/.test(imageDigest)) {
      throw new TypeError('CORE_JS_IMAGE_DIGEST must be a sha256 digest when CORE_JS_CACHE_DIR is set');
    }
    cacheDirectory = join(cacheRoot, imageDigest.slice('sha256:'.length));
  }

  return { manifestPath, cacheDirectory, host, port: Number(portValue) };
}
