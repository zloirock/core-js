// proposal stage: 0
// https://github.com/bakkot/proposal-iterator-join

interface Iterator<T> {
  join(separator?: unknown): string;
}
