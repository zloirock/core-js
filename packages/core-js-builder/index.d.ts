type Summary = {
    size: boolean,
    modules: boolean
};

type StringOrRegExp = string | RegExp;

type MinEnvTarget = Record<string, string | readonly string[]> | { esmodules?: boolean };

type Options = {
    /** entry / module / namespace / an array of them, by default - all `core-js` modules */
    modules?: StringOrRegExp | readonly StringOrRegExp[],
    /** a blacklist of entries / modules / namespaces, by default - empty list */
    exclude?: StringOrRegExp | readonly StringOrRegExp[],
    /** optional browserslist or core-js-compat format query */
    targets?: string | readonly string[] | MinEnvTarget,
    /** output format, 'bundle' by default, can be 'cjs' or 'esm', and in this case
     *  the result will not be bundled and will contain imports of required modules */
    format?: 'bundle' | 'esm' | 'cjs',
    /** optional target filename, if it's missed a file will not be created */
    filename?: string,
    /** shows summary for the bundle, disabled by default */
    summary?: {
        /** in the console, you could specify required parts or set `true` for enable all of them */
        comment?: Summary,
        /**  in the comment in the target file, similarly to `summary.console` */
        console?: Summary,
    }
};

declare function builder(options: Options): Promise<string>;

export = builder;
