import type compat from "@core-js/compat/compat";

type CompatOptions = Exclude<Parameters<typeof compat>[0], undefined>;

/** browserslist targets, in every form `@core-js/compat` accepts */
type Targets = CompatOptions["targets"];

/** reports a condition to the developer once, however many times it is hit */
type Warn = (condition: string, message: string) => boolean;

interface Options {
  /** the modules the application can reach for, as the build sees them. required: the fallback
   *  would be the whole of core-js, at several times the cost and without a word */
  scope: readonly string[];
  /** the declared support. by default the project browserslist config, and the whole floor of
   *  core-js when there is none */
  targets?: Targets | null;
  /** used `core-js` version. Special values: `'node_modules'` (default; auto-detect from installed
   *  core-js); `'package.json'` (read from CWD `package.json`'s `dependencies` / `devDependencies` /
   *  `peerDependencies`). When specified as an explicit SemVer string, the minor component is
   *  required, e.g. `'4.1'` */
  version?: string | null;
  /** path to search the browserslist config at */
  configPath?: string | null;
  /** browserslist environment */
  browserslistEnv?: string | null;
  /** ignore the project browserslist config */
  ignoreBrowserslistConfig?: boolean | null;
  /** polyfill modules to exclude, by name or pattern */
  exclude?: readonly (string | RegExp)[];
  /** minify the bundles, `true` by default. part of the identity of a bundle */
  minify?: boolean;
  /** where developer-facing warnings go, by default `console.warn`. deduplication is applied
   *  before the message reaches it, so an application logger can be passed as it is */
  warn?: ((message: string) => void) | null;
}

interface Configuration {
  scope: readonly string[];
  exclude: readonly (string | RegExp)[];
  targets: Targets | null;
  minify: boolean;
  versions: { coreJS: string, compat: string };
}

interface Bucket {
  bundleId: string;
  modules: readonly string[];
  targets: readonly { engine: string, version: string }[];
  share: number;
}

interface Plan {
  /** the name of this plan: what a store keeps or drops whole */
  generation: string;
  baseline: { bundleId: string, modules: readonly string[], targets: Targets | null };
  byEngine: Map<string, { version: string, bundleId: string }[]>;
  buckets: Bucket[];
}

interface Service {
  config: Configuration;
  plan: Plan;
  warn: Warn;
}

declare function createService(options: Options): Service;

export default createService;
