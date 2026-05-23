import type compat from "@core-js/compat/compat";

type CompatOptions = Exclude<Parameters<typeof compat>[0], undefined>;

type Method = 'entry-global' | 'usage-global' | 'usage-pure';

type Mode = 'es' | 'stable' | 'actual' | 'full';

// rich Targets re-exported from `@core-js/compat/compat` - same shape as babel-plugin's
// `Pick<CompatOptions, "targets">`. preserves per-engine literal keys (chrome / firefox /
// node / ...), `esmodules: true | 'intersect'`, and `browsers: BrowserslistQuery` form
type Targets = CompatOptions["targets"];

interface BaseOptions {
  /** used `core-js` version. Special values: `'node_modules'` (default; auto-detect from installed core-js); `'package.json'` (read from CWD `package.json`'s `dependencies` / `devDependencies` / `peerDependencies`). When specified as an explicit SemVer string, the minor component is required, e.g. `'4.1'` */
  version?: string | null;
  /** entry point layer: 'es', 'stable', 'actual', or 'full', by default 'actual' */
  mode?: Mode | null;
  /** the package to use for imports, by default 'core-js' for global, '@core-js/pure' for pure */
  package?: string | null;
  /** additional packages to recognize as core-js entry points */
  additionalPackages?: readonly string[] | null;
  /** browserslist targets */
  targets?: Targets | null;
  /** include polyfill modules by module name (e.g. `'es.array.at'`) or pattern.
   *  String patterns are raw regex syntax (not glob) anchored to start/end - a leading `es.`
   *  matches any submodule, `*` is a regex quantifier. Entry paths (`'array/at'`) are allowed
   *  only for `method: 'usage-pure'`. */
  include?: readonly (string | RegExp)[] | null;
  /** exclude polyfill modules - same pattern semantics as `include` */
  exclude?: readonly (string | RegExp)[] | null;
  /** enable debug output */
  debug?: boolean | null;
  /** custom function to decide whether to inject a polyfill */
  shouldInjectPolyfill?: ((name: string, defaultShouldInject: boolean) => boolean) | null;
  /** use absolute imports for injected polyfills */
  absoluteImports?: boolean | null;
  /** directory to search for browserslist config (for monorepos) */
  configPath?: string | null;
  /** browserslist env name (falls back to `production` / `defaults`) */
  browserslistEnv?: string | null;
  /** do not use browserslist config, only explicit `targets` */
  ignoreBrowserslistConfig?: boolean | null;
  /** treat proposals that have been shipped in browsers as stable features */
  shippedProposals?: boolean | null;
  /** import style for injected polyfills: 'import' (ESM) or 'require' (CJS), by default auto-detected from sourceType */
  importStyle?: 'import' | 'require' | null;
}

interface EntryGlobalOptions extends BaseOptions {
  method: 'entry-global';
  /** `entry-global` runs at pre; explicit non-`'pre'` value is rejected at runtime */
  phase?: 'pre' | null;
}

interface UsageOptions extends BaseOptions {
  method: 'usage-global' | 'usage-pure';
  /** Where in the bundler plugin chain to run:
   *  - `'pre'` (default): before siblings - full semantic context; misses helper polyfills.
   *  - `'post'`: after siblings - covers helpers; stripped type info may over-polyfill.
   *  - `'pre+post'`: pre handles user code, post catches helpers (inherits post's risk).
   */
  phase?: 'pre' | 'post' | 'pre+post' | null;
}

/** discriminated union: TS catches `phase: 'post'` on `entry-global` at compile time */
type Options = EntryGlobalOptions | UsageOptions;

type BundlerPlugin<T> = (options: Options) => T;

export declare const vite: BundlerPlugin<any>;
export declare const webpack: BundlerPlugin<any>;
export declare const rollup: BundlerPlugin<any>;
export declare const esbuild: BundlerPlugin<any>;
export declare const rspack: BundlerPlugin<any>;
export declare const rolldown: BundlerPlugin<any>;
export declare const farm: BundlerPlugin<any>;
export declare const bun: BundlerPlugin<any>;

/** identifier-filter used by every adapter's `transformInclude` hook. exposed so consumers
 *  can pre-filter resources outside the plugin (custom loaders, etc.) */
export declare function shouldTransform(id: string): boolean;

/** the unplugin factory backing every named adapter above. shape mirrors upstream's
 *  `UnpluginInstance<Options>` but avoids the import to keep the typed surface from
 *  pulling in transitive bundler deps (rollup, esbuild, bun, rspack, farm, ...) that
 *  consumers of this `.d.ts` may not have installed */
interface UnpluginInstance {
  vite: BundlerPlugin<any>;
  webpack: BundlerPlugin<any>;
  rollup: BundlerPlugin<any>;
  esbuild: BundlerPlugin<any>;
  rspack: BundlerPlugin<any>;
  rolldown: BundlerPlugin<any>;
  farm: BundlerPlugin<any>;
  bun: BundlerPlugin<any>;
  raw: (options: Options, meta: any) => any;
}
declare const unplugin: UnpluginInstance;
export default unplugin;

export type { Options, Method, Mode, Targets };
