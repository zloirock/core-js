// proposal stage: 4
// https://github.com/tc39/proposal-regex-escaping

interface RegExpConstructor {
  escape(string: string): string;
}

declare var RegExp: RegExpConstructor;
