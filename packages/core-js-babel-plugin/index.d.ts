import type compat from "@core-js/compat/compat";

type CompatOptions = Exclude<Parameters<typeof compat>[0], undefined>;

type Method = 'entry-global' | 'usage-global' | 'usage-pure';

type Mode = 'es' | 'stable' | 'actual' | 'full';

// rich Targets re-exported from `@core-js/compat/compat`. preserves per-engine literal keys
// (chrome / firefox / node / ...), `esmodules: true | 'intersect'`, and `browsers:
// BrowserslistQuery` form. parity with unplugin's `Targets` export
type Targets = CompatOptions["targets"];

type Options = {
  /** polyfilling method: 'entry-global', 'usage-global' or 'usage-pure' */
  method: Method,
  /** browserslist targets */
  targets?: Targets | null,
  /** used `core-js` version, by default 'node_modules' (auto-detected from installed core-js). When specified explicitly, the minor component is required, e.g. '4.1' */
  version?: string | null,
  /** entry point layer: 'es', 'stable', 'actual', or 'full', by default 'actual' */
  mode?: Mode | null,
  /** the package to use for imports, by default 'core-js' for global, '@core-js/pure' for pure */
  package?: string | null,
  /** additional packages to recognize as core-js entry points */
  additionalPackages?: readonly string[] | null,
  /** include polyfill modules by module name (e.g. `'es.array.at'`) or pattern.
   *  String patterns are raw regex syntax (not glob) anchored to start/end - a leading `es.`
   *  matches any submodule, `*` is a regex quantifier. Entry paths (`'array/at'`) are allowed
   *  only for `method: 'usage-pure'`. */
  include?: readonly (string | RegExp)[] | null,
  /** exclude polyfill modules - same pattern semantics as `include` */
  exclude?: readonly (string | RegExp)[] | null,
  /** enable debug output */
  debug?: boolean | null,
  /** custom function to decide whether to inject a polyfill */
  shouldInjectPolyfill?: ((name: string, defaultShouldInject: boolean) => boolean) | null,
  /** use absolute imports for injected polyfills */
  absoluteImports?: boolean | null,
  /** directory to search for browserslist config (for monorepos) */
  configPath?: string | null,
  /** browserslist env name (falls back to `production` / `defaults`) */
  browserslistEnv?: string | null,
  /** do not use browserslist config, only explicit `targets` */
  ignoreBrowserslistConfig?: boolean | null,
  /** treat proposals that have been shipped in browsers as stable features */
  shippedProposals?: boolean | null,
  /** import style for injected polyfills: 'import' (ESM) or 'require' (CJS), by default auto-detected from sourceType */
  importStyle?: 'import' | 'require' | null,
};

declare function plugin(api: object, options: Options, dirname: string): { name: string, visitor: object };

export default plugin;
export type { Options, Method, Mode, Targets };
