// https://github.com/tc39/proposal-regex-escaping

interface RegExpConstructor {
  /**
   * Escapes a string to be used in a regular expression.
   * @param string - The string to escape.
   * @returns The escaped string.
   */
  escape(string: string): string;
}

declare var RegExp: RegExpConstructor;
