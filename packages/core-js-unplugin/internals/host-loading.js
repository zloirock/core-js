import { readFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import { moduleIdLanguage } from '@core-js/polyfill-provider/helpers/path-normalize';

// esbuild's onLoad is first-wins, including when a transform declines. Own only file loads
// whose transformed result we actually return; foreign namespaces and raw components stay
// with their loaders. A sibling onLoad cannot be interleaved with this transform.
export function esbuildSetup(include, transform) {
  return build => {
    const warnings = [];
    build.onStart(() => { warnings.length = 0; });
    // Returning even a warnings-only onLoad result claims the load. Report at build end
    // so a declined parse can still reach the next loader, and reset on every rebuild.
    build.onEnd(() => ({ warnings: warnings.splice(0) }));
    build.onLoad({ filter: /.*/, namespace: 'file' }, async args => {
      const id = args.path + (args.suffix ?? '');
      if (!include(id)) return;
      const language = moduleIdLanguage(args.path);
      const extension = extname(args.path);
      const loader = build.initialOptions.loader?.[extension]
        ?? (language?.ts ? language.jsx ? 'tsx' : 'ts' : extension === '.jsx' ? 'jsx' : 'js');
      if (!['js', 'jsx', 'ts', 'tsx'].includes(loader)) return;
      const result = await transform.call({ warn: warning => warnings.push({ text: String(warning) }) },
        await readFile(args.path, 'utf8'), id, { loader });
      if (!result) return;
      let contents = result.code;
      if (result.map) contents += `\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${ Buffer.from(JSON.stringify(result.map)).toString('base64') }`;
      return { contents, loader, resolveDir: dirname(args.path), watchFiles: [args.path] };
    });
  };
}

// Rspack exposes the noParse configuration but not webpack's native matching method.
// Preserve RegExp state: the compiler will ask the same rule after its loaders finish.
function matchesNoParse(rule, request, module) {
  if (Array.isArray(rule)) return rule.some(item => matchesNoParse(item, request, module));
  if (typeof rule === 'string') return module?.applyNoParseRule ? module.applyNoParseRule(rule, request) : request.startsWith(rule);
  if (typeof rule === 'function') return rule(request);
  if (!rule) return false;
  const { lastIndex } = rule;
  try {
    return rule.test(request);
  } finally {
    rule.lastIndex = lastIndex;
  }
}

// Module kind and noParse are compiler facts, unavailable from source text or a filename.
// Return null for bodies the compiler will not interpret as JavaScript dependencies.
export function webpackModuleType(context) {
  const native = context?.getNativeBuildContext?.();
  const loader = native?.loaderContext;
  const { _module: module } = loader ?? {};
  const type = module?.type;
  if (type && !type.startsWith('javascript/')) return null;
  const noParse = native?.compiler?.options?.module?.noParse;
  const request = module?.request ?? loader?.resource;
  if (noParse && request && matchesNoParse(noParse, request, module)) return null;
  return type;
}
