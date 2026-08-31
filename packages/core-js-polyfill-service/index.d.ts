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
  /** where the built bundles are kept between restarts. `null` by default, which keeps them in
   *  memory alone and warms up again on every start */
  directory?: string | null;
  /** how many generations of bundles stay on disk beside the one being served, `1` by default.
   *  `0` keeps only the generation being served, `null` keeps every generation forever */
  retain?: number | null;
  /** where the bundles are mounted, `'/__core-js'` by default */
  route?: string;
  /** store a brotli encoding beside gzip, `false` by default: it costs several times the build
   *  itself for a modest win over gzip */
  brotli?: boolean;
  /** where developer-facing warnings go, by default `console.warn`. deduplication is applied
   *  before the message reaches it, so an application logger can be passed as it is */
  warn?: ((message: string) => void) | null;
}

interface Configuration {
  scope: readonly string[];
  exclude: readonly (string | RegExp)[];
  targets: Targets | null;
  minify: boolean;
  directory: string | null;
  retain: number | null;
  brotli: boolean;
  route: string;
  versions: { coreJS: string, compat: string, builder: string };
}

interface Bucket {
  bundleId: string;
  modules: readonly string[];
  /** every engine of the bucket, at the lowest version of it that landed there */
  targets: Record<string, string>;
  share: number;
}

/** the bundle store: bytes by identifier and encoding, never a path.
 *  the bytes are typed as `Uint8Array`, which is what a `Buffer` is: naming `Buffer` here would
 *  make every consumer of these types need `@types/node` */
interface Bundles {
  encodings: readonly string[];
  /** the generation being served: one directory of the store */
  generation: string;
  has(bundleId: string): Promise<boolean>;
  get(bundleId: string, encoding: string): Promise<Uint8Array | null>;
  modules(bundleId: string): Promise<readonly string[] | null>;
  put(bundleId: string, bundle: { modules: readonly string[], script: string }): Promise<void>;
  /** removes the generations that are neither served nor younger than `retain`, and answers with
   *  the names of those it removed */
  prune(): Promise<string[]>;
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
  bundles: Bundles;
  warn: Warn;
  /** the address a bundle is served under */
  urlOf(bundleId: string): string;
  /** request headers to the name of the bundle for that visitor */
  chooseBundle(headers: Record<string, string | string[] | undefined>): string;
  /** the beginning of an HTML response, with the tag put where it runs before the application */
  scriptTag(prefix: string, options: { src: string, csp?: string | null }): string;
  /** answers one request for a bundle */
  serve(request: { headers: Record<string, string | string[] | undefined> }, response: unknown,
    bundleId: string): Promise<void>;
  /** starts the warm-up, idempotently. `ready` is the baseline, which requests wait for; `warmed`
   *  is the rest of the plan, which they do not - a miss goes to the baseline */
  start(): { ready: Promise<boolean>, warmed: Promise<{ built: string[], failed: string[] }> };
}

declare function createService(options: Options): Service;

export default createService;
