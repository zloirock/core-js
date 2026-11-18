import { join } from 'node:path';

const POSITIVE_DECIMAL = /^[1-9]\d*$/;

export function settingsFrom(env) {
  const manifestPath = env.CORE_JS_MANIFEST_PATH;
  const releasesDir = env.CORE_JS_RELEASES_DIR;
  const retention = env.CORE_JS_RELEASE_RETENTION_SECONDS;
  const cacheRoot = env.CORE_JS_CACHE_DIR;
  const imageDigest = env.CORE_JS_IMAGE_DIGEST;
  const host = env.HOST === undefined ? '0.0.0.0' : env.HOST;
  const portValue = env.PORT === undefined ? '3000' : env.PORT;

  let releases;
  if (releasesDir !== undefined) {
    if (typeof releasesDir !== 'string' || !releasesDir || manifestPath !== undefined) {
      throw new TypeError('CORE_JS_RELEASES_DIR must be a nonempty string and used without CORE_JS_MANIFEST_PATH');
    }
    if (retention !== undefined && (typeof retention !== 'string' ||
      !POSITIVE_DECIMAL.test(retention) || !Number.isSafeInteger(Number(retention)))) {
      throw new TypeError('CORE_JS_RELEASE_RETENTION_SECONDS must be a positive decimal integer');
    }
    releases = { directory: releasesDir, retentionSeconds: retention === undefined ? 7 * 24 * 60 * 60 : Number(retention) };
  } else if (typeof manifestPath !== 'string' || !manifestPath) {
    throw new TypeError('CORE_JS_MANIFEST_PATH must be a nonempty string');
  } else if (retention !== undefined) {
    throw new TypeError('CORE_JS_RELEASE_RETENTION_SECONDS requires CORE_JS_RELEASES_DIR');
  }
  if (typeof host !== 'string' || !host) {
    throw new TypeError('HOST must be a nonempty string');
  }
  if (typeof portValue !== 'string' || !POSITIVE_DECIMAL.test(portValue) || Number(portValue) > 65535) {
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

  return { ...releases ? { releases } : { manifestPath }, cacheDirectory, host, port: Number(portValue) };
}
