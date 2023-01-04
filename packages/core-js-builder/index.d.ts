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

type Targets = {
  [target in Target]?: string | number;
} & {
  browsers?: BrowserslistQuery,
  esmodules?: boolean,
};

type Format = 'bundle' | 'esm' | 'cjs';

type SummaryEntry = boolean | {
  size?: boolean,
  modules?: boolean,
};

type Summary = {
  comment?: SummaryEntry,
  console?: SummaryEntry,
};

type Options = {
  modules?: Modules,
  exclude?: Modules,
  targets?: Targets | BrowserslistQuery,
  format?: Format,
  filename?: string,
  summary?: Summary,
};

declare function builder(options: Options): Promise<string>;

export = builder;
