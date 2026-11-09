import { parseSync } from 'oxc-parser';
import { dirname } from 'node:path';
import { brand } from '@core-js/polyfill-provider/helpers/error-tag';

// A user-provided loader in an ESM banner makes synchronous external requires intentional.
// Inspect top-level bindings, not a substring that could be a comment or a nested function.
function bannerProvidesRequire(banner) {
  if (!banner) return false;
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides a sync API
  const parsed = parseSync('banner.mjs', banner, { sourceType: 'module' });
  if (parsed.errors.some(error => error.severity === 'Error')) return false;
  return parsed.program.body.some(statement => {
    const node = statement.declaration ?? statement;
    return node.type === 'VariableDeclaration'
      ? node.declarations.some(declaration => declaration.id.type === 'Identifier' && declaration.id.name === 'require' && declaration.init)
      : node.type === 'FunctionDeclaration' ? node.id?.name === 'require'
        : node.type === 'ImportDeclaration' && node.specifiers.some(specifier => specifier.local.name === 'require');
  });
}

// A synchronous CJS dependency cannot be replaced by a namespace or a Promise. Keep the
// user's external policy intact and fail at build time instead of emitting broken code.
function externalRequireError(source, importer, host) {
  return new Error(brand(`${ host }: injected require(${ JSON.stringify(source) }) in ${ importer } cannot load this external dependency synchronously. `
    + 'Bundle the core-js dependency, or configure a CommonJS-compatible external loader '
    + '(createRequire for Node ESM; node-commonjs in webpack/rspack).'));
}

// Ask esbuild's resolver, including aliases and sibling plugins. A declaration in the user's
// banner is their explicit loader; platform: node alone does not provide require in ESM.
export async function validateEsbuildRequires(build, requires, importer) {
  if (!requires?.length || build.initialOptions.format !== 'esm' || bannerProvidesRequire(build.initialOptions.banner?.js)) return;
  for (const [source] of requires) {
    const resolved = await build.resolve(source, { importer, resolveDir: dirname(importer), kind: 'require-call' });
    if (resolved.external) throw externalRequireError(source, importer, 'esbuild');
  }
}

// Rollup-compatible hosts retain transform metadata in their module cache. Read only emitted
// modules, so dead files and watch rebuilds do not acquire stale or speculative diagnostics.
export function externalRequireHooks() {
  let platform;
  return {
    options(options) { platform = options.platform; },
    async generateBundle(options, bundle) {
      if (options.format !== 'es' || platform === 'node' || this.environment?.config.consumer === 'server') return;
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        for (const id of Object.keys(chunk.modules)) {
          const requires = this.getModuleInfo(id)?.meta.coreJSRequires;
          for (const [source] of requires ?? []) {
            const resolved = await this.resolve(source, id, { skipSelf: true });
            // Inspect the emitted binding rather than calling a user-supplied banner twice.
            if (resolved?.external && !bannerProvidesRequire(chunk.code)) throw externalRequireError(source, id, 'ESM output');
          }
        }
      }
    },
  };
}

// The resolved external type belongs to each dependency, not the compiler-wide default.
// Rspack exposes it only through the canonical external module identifier.
export function webpackExternalRequires(compiler) {
  const name = 'core-js:external-requires';
  compiler.hooks.compilation.tap(name, compilation => {
    compilation.hooks.processAssets.tap(name, () => {
      for (const module of compilation.modules) {
        const requires = module.buildInfo?.coreJSRequires;
        if (!requires?.length || ![...compilation.chunkGraph.getModuleChunksIterable(module)].length) continue;
        for (const connection of compilation.moduleGraph.getOutgoingConnections(module)) {
          const source = connection.dependency?.request;
          const record = requires.find(entry => entry[0] === source);
          if (!record) continue;
          const external = connection.module;
          const match = external?.identifier().match(/^external (?<type>import|module) (?<request>.+)$/);
          if (!match) continue;
          const { type, request: requestText } = match.groups;
          const request = external.request ?? JSON.parse(requestText);
          const selected = Array.isArray(request) || typeof request !== 'object' ? request : request[type];
          // An explicit external member path already selects the default value. Rspack does
          // not expose exportsType, so derive that same namespace fact from its request.
          const namespace = external.buildMeta?.exportsType === 'namespace'
            || external.buildMeta?.exportsType === undefined && (!Array.isArray(selected) || selected.length < 2);
          if (type === 'import' || type === 'module' && record[1] && namespace) {
            compilation.errors.push(externalRequireError(source, module.resource, 'webpack/rspack'));
          }
        }
      }
    });
  });
}
