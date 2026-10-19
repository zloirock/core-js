// a generic function's indexed return reads the argument it was called with: `T[keyof T]` folds
// the values the argument is declared with - or a fresh literal's own values - and a literal key
// reads that one member
interface Config {
  hosts: string[];
  ports: string[];
}
declare function valueOf<T>(source: T): T[keyof T];
declare function get<T, K extends keyof T>(source: T, key: K): T[K];
declare const config: Config;
valueOf(config).at(0);
get(config, 'hosts').includes('a');
valueOf({ hosts: ['a'], ports: ['b'] }).find(Boolean);
