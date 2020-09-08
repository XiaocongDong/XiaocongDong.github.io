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
testCases['Counter(closure).simple'] = `
function createCounter() {
  let a = 0;
  return function() {
      a = a + 1;
      return a;
  };
};

let c1 = createCounter();
let c2 = createCounter();
console.log(c1());
console.log(c1());
console.log(c2());
console.log(c2());
`

export default testCases
