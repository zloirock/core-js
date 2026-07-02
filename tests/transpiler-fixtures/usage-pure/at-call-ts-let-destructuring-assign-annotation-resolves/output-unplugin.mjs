import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const data: { title: string };
let title;
({ title } = data);
_atMaybeString(title).call(title, -1);