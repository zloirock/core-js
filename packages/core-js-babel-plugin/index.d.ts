import type compat from "@core-js/compat/compat";

type CompatOptions = Exclude<Parameters<typeof compat>[0], undefined>;

type Method = 'entry-global' | 'usage-global' | 'usage-pure';

type Mode = 'es' | 'stable' | 'actual' | 'full';

type Options = Pick<CompatOptions, "targets"> & {
  /** polyfilling method: 'entry-global', 'usage-global' or 'usage-pure' */
  method: Method,
  /** used `core-js` version, by default '4.0' */
  version?: string,
  /** entry point layer: 'es', 'stable', 'actual', or 'full', by default 'actual' */
  mode?: Mode,
  /** the package to use for imports, by default 'core-js' for global, '@core-js/pure' for pure */
  pkg?: string,
  /** additional packages to recognize as core-js entry points */
  pkgs?: string[],
  /** include specific polyfills by name or pattern */
  include?: readonly (string | RegExp)[],
  /** exclude specific polyfills by name or pattern */
  exclude?: readonly (string | RegExp)[],
  /** enable debug output */
  debug?: boolean,
  /** custom function to decide whether to inject a polyfill */
  shouldInjectPolyfill?: (name: string, defaultShouldInject: boolean) => boolean,
  /** use absolute imports for injected polyfills */
  absoluteImports?: boolean | string,
  /** browserslist config path */
  configPath?: string,
  /** ignore browserslist config files */
  ignoreBrowserslistConfig?: boolean,
};

declare function plugin(api: object, options: Options, dirname: string): { name: string, visitor: object };

export = plugin;
