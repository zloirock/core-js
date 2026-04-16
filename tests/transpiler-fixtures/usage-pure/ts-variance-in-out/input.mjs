interface Writer<in T> { write(value: T): void; }
interface Reader<out T> { read(): T; }
declare const reader: Reader<string[]>;
reader.read().at(0);
