interface Dict {
  get(key: 'a'): string;
  get(key: 'b'): number;
}
declare const d: Dict;
d.get('a').at(0);
