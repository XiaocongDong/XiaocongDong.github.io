const testCases = {}
testCases['helloworld.simple'] = `console.log('Hello World');`
testCases['variable.simple'] = `let n = 10;
let b = true;
let s = 'string';
let f = function(x, y, z) {return x + y * z;};
let a = [1, 2, 3, {name: 'hi'}, 'hi'];
let o = {
  name: 'sean',
  age: 27
};

console.log(b);
console.log(s);
console.log(f(1,2,3));
console.log(a[1]);
console.log(o.name);
`

export default testCases
