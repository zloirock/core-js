// proposal stage: 4
// https://github.com/tc39/proposal-regex-escaping

interface RegExpConstructor {
  /**
   * Escapes a string to be used in a regular expression.
   * @param string
   * @returns The escaped string.
   */
  escape(string: string): string;
}

declare var RegExp: RegExpConstructor;
