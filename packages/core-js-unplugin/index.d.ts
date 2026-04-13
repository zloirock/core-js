type Method = 'entry-global' | 'usage-global' | 'usage-pure';

type Mode = 'es' | 'stable' | 'actual' | 'full';

type Targets = string | string[] | Record<string, string | number | boolean | string[]>;

interface Options {
  /** polyfilling method: 'entry-global', 'usage-global' or 'usage-pure' */
  method: Method;
  /** used `core-js` version, by default 'node_modules' (auto-detected from installed core-js). When specified explicitly, the minor component is required, e.g. '4.1' */
  version?: string;
  /** entry point layer: 'es', 'stable', 'actual', or 'full', by default 'actual' */
  mode?: Mode;
  /** the package to use for imports, by default 'core-js' for global, '@core-js/pure' for pure */
  package?: string;
  /** additional packages to recognize as core-js entry points */
  additionalPackages?: string[];
  /** browserslist targets */
  targets?: Targets;
  /** include specific polyfills by name or pattern */
  include?: readonly (string | RegExp)[];
  /** exclude specific polyfills by name or pattern */
  exclude?: readonly (string | RegExp)[];
  /** enable debug output */
  debug?: boolean;
  /** custom function to decide whether to inject a polyfill */
  shouldInjectPolyfill?: (name: string, defaultShouldInject: boolean) => boolean;
  /** use absolute imports for injected polyfills */
  absoluteImports?: boolean;
  /** directory to search for browserslist config (for monorepos) */
  configPath?: string;
  /** do not use browserslist config, only explicit `targets` */
  ignoreBrowserslistConfig?: boolean;
  /** treat proposals that have been shipped in browsers as stable features */
  shippedProposals?: boolean;
  /** import style for injected polyfills: 'import' (ESM) or 'require' (CJS), by default auto-detected from sourceType */
  importStyle?: 'import' | 'require';
}

type BundlerPlugin<T> = (options: Options) => T;

export declare const vite: BundlerPlugin<any>;
export declare const webpack: BundlerPlugin<any>;
export declare const rollup: BundlerPlugin<any>;
export declare const esbuild: BundlerPlugin<any>;
export declare const rspack: BundlerPlugin<any>;
export declare const rolldown: BundlerPlugin<any>;
export declare const farm: BundlerPlugin<any>;
export declare const bun: BundlerPlugin<any>;

export type { Options, Method, Mode, Targets };
