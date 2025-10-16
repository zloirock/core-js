// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-chunking

import { CoreJsIteratorObject } from './core-js-types/core-js-types';

declare global {
  interface Iterator<T> {
    chunks(chunkSize: number): CoreJsIteratorObject<T[]>;

    windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): CoreJsIteratorObject<T[]>;
  }
}

export {};
