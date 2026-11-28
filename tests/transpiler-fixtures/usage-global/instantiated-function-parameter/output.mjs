import "core-js/modules/es.string.at";
declare function pluck<T>(items: T[], key: T): T[];
type Key = Parameters<typeof pluck<string>>[1];
function read(key: Key) {
  return key.at(0);
}
export const result = read('abc');