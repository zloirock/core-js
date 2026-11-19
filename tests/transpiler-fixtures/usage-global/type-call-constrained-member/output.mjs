import "core-js/modules/es.array.at";
// Annotation-level member lookup uses the same literal inference as a direct return.
declare function read<T extends string>(mode: T): {
  rows: T extends 'lines' ? number[] : string;
};
read('lines').rows.at(-1);