// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-chunking

import { CoreJSIteratorObject } from '../core-js-types/core-js-types';

declare global {
  interface Iterator<T> {
    chunks(chunkSize: number): CoreJSIteratorObject<T[]>;

    windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): CoreJSIteratorObject<T[]>;
  }
}

export {};
