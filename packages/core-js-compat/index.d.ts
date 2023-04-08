type StringOrRegExp = string | RegExp;

type Modules = StringOrRegExp | readonly StringOrRegExp[];

type ModuleName = string;

type Target =
  | 'android'
  | 'bun'
  | 'chrome'
  | 'chrome-android'
  | 'deno'
  | 'edge'
  | 'electron'
  | 'firefox'
  | 'firefox-android'
  | 'hermes'
  | 'ie'
  | 'ios'
  | 'node'
  | 'opera'
  | 'opera-android'
  | 'phantom'
  | 'quest'
  | 'react-native'
  | 'rhino'
  | 'safari'
  | 'samsung';

type BrowserslistQuery = string | ReadonlyArray<string>;

type Environments = {
  [target in Target]?: string | number;
};

type Targets = Environments & {
  browsers?: Environments | BrowserslistQuery,
  esmodules?: boolean,
};

type Options = {
  /** entry / module / namespace / an array of them, by default - all `core-js` modules */
  modules?: Modules,
  /** a blacklist, entry / module / namespace / an array of them, by default - empty list */
  exclude?: Modules,
  /** optional browserslist or core-js-compat format query */
  targets?: Targets | BrowserslistQuery,
  /** used `core-js` version, by default the latest */
  version?: string,
  /** inverse of the result, shows modules that are NOT required for the target environment */
  inverse?: boolean,
  /**
   * @deprecated use `modules` instead
   */
  filter?: Modules
};

type TargetVersion = string;

type Output = {
  /** array of required modules */
  list: ModuleName[],
  /** object with targets for each module */
  targets: {
    [module: ModuleName]: {
      [target in Target]?: TargetVersion
    }
  }
}

type CompatData = {
  [module: ModuleName]: {
    [target in Target]?: TargetVersion
  }
};

declare const ExportedCompatObject: {
  compat(options?: Options): Output,

  /** The subset of modules which available in the passed `core-js` version */
  getModulesListForTargetVersion(version: string): readonly ModuleName[],

  /** Full list compatibility data */
  data: CompatData,

  /** map of modules by `core-js` entry points */
  entries: {[entry_point: string]: readonly ModuleName[]},

  /** Full list of modules */
  modules: readonly ModuleName[]
}

export = ExportedCompatObject
