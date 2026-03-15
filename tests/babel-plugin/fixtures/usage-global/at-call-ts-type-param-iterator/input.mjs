function first<T>(it: Iterator<T>): T { return it.next().value; }
const it: Iterator<string> = [].values();
first(it).at(0).bold();
