// proposal stage: 4
// https://github.com/tc39/proposal-string-matchall

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2020.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface String {
  matchAll(regexp: RegExp): RegExpStringIterator<RegExpExecArray>;
}
