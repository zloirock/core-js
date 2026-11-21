import type compat from "core-js-compat";

type Format = 'bundle' | 'esm' | 'cjs';

type SummaryEntry = boolean | null | {
  size?: boolean,
  modules?: boolean,
};

type Summary = {
  /** in the comment, you could specify required parts or set `true` for enable all of them */
  comment?: SummaryEntry,
  /** in the console, you could specify required parts or set `true` for enable all of them */
  console?: SummaryEntry,
};

type CompatOptions = Exclude<Parameters<typeof compat.compat>[0], undefined>;

type Options = Pick<CompatOptions, "exclude" | "modules" | "targets"> & {
  /** output format, 'bundle' by default, can be 'cjs' or 'esm', and in this case
   *  the result will not be bundled and will contain imports of required modules */
  format?: Format | null,
  /** optional target filename, if it's missed a file will not be created */
  filename?: string,
  /** shows summary for the bundle, disabled by default */
  summary?: Summary | null,
};

declare function builder(options?: Options): Promise<string>;

declare namespace builder {
  function formatSize(source: string): string;
}

export = builder;
