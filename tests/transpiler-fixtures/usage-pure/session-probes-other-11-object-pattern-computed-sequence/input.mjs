const k = 'k';
{
var t = 0, { [(k++, 'at')]: a } = [1];
}
{
var { [(k++, 'at')]: a } = [1], t = 0;
}
