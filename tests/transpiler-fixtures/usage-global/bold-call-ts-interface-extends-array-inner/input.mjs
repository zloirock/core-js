interface StringArray extends Array<string> {}
interface DerivedArray extends StringArray {}
declare const arr: StringArray;
declare const darr: DerivedArray;
arr.at(0).bold();
darr.at(0).sub();
