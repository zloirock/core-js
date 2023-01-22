type StringOrRegExp = string | RegExp;

type Modules = StringOrRegExp | readonly StringOrRegExp[];

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

type Format = 'bundle' | 'esm' | 'cjs';

type SummaryEntry = boolean | {
  size?: boolean,
  modules?: boolean,
};

type Summary = {
  /** in the console, you could specify required parts or set `true` for enable all of them */
  comment?: SummaryEntry,
  /** in the comment, you could specify required parts or set `true` for enable all of them */
  console?: SummaryEntry,
};

type Options = {
  /** entry / module / namespace / an array of them, by default - all `core-js` modules */
  modules?: Modules,
  /** a blacklist, entry / module / namespace / an array of them, by default - empty list */
  exclude?: Modules,
  /** optional browserslist or core-js-compat format query */
  targets?: Targets | BrowserslistQuery,
  /** output format, 'bundle' by default, can be 'cjs' or 'esm', and in this case
   *  the result will not be bundled and will contain imports of required modules */
  format?: Format,
  /** optional target filename, if it's missed a file will not be created */
  filename?: string,
  /** shows summary for the bundle, disabled by default */
  summary?: Summary,
};

declare function builder(options?: Options): Promise<string>;

export = builder;
