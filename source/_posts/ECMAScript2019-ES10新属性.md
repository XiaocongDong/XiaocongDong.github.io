---
title: 详解ECMAScript2019/ES10新属性
tags:
  - JavaScript
  - ECMAScript
  - 2019
categories:
  - JavaScript
date: 2019-12-05 18:04:15
---

每年都有一些新的属性进入[ECMA262](https://tc39.es/ecma262/#sec-intro)标准，今年发布的ECMAScript2019/ES10同样也有很多新的特性，本文将会挑选一些普通开发者会用到的新属性进行深入的解读。
## Array.prototype.flat()
> The flat() method creates a new array with all sub-array elements concatenated into it recursively up to the specified depth. -- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)

简单来说flat这个函数就是按照一定的深度depth将一个深层次嵌套的数组拍扁, 例子:
```javascript
const nestedArr = [1, 2, [3, 4, [5, 6, [7, [8], 9]]], 10]
console.log(nestedArr.flat())
// [1, 2, 3, 4, [5, 6, [7, [8], 9]], 10]
console.log(nestedArr.flat(2))
// [1, 2, 3, 4, 5, 6, [7, [8], 9], 10]
console.log(nestedArr.flat(3))
// [1, 2, 3, 4, 5, 6, 7, [8], 9, 10]
console.log(nestedArr.flat(4))
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
console.log(nestedArr.flat(Infinity))
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```
由上面的例子可以看出flat会按照指定的深度depth将一个数组扁平化，如果需要将数组完全拍扁变成一维数组，则指定depth为无限大，即是**Infinity**，相反如果不指定深度，其默认值是1。
## Array.prototype.flatMap()
> The flatMap() method first maps each element using a mapping function, then flattens the result into a new array. It is identical to a map() followed by a flat() of depth 1, but flatMap() is often quite useful, as merging both into one method is slightly more efficient. -- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)

简单来说flatMap等于一个数组先调用完map函数再调用flat函数将其扁平化，扁平化的深度固定为1，先通过一个简单的例子感受一下:
```javascript
const myArr = [1, 2, 3]
myArr
  .map(n => [n * n]) // [[1], [4], [9]]
  .flat() // [1, 4, 9]

// 用flatMap可以一步到位
myArr.flatMap(n => [n * n]) // [1, 4, 9]
```
从上面的例子来看flatMap如果只是将flat和map做了一个简单的组合好像可有可无，其实不然，flatMap有个强大的功能是可以在map的时候添加和删除元素，这个无论是map还是filter都没有这个功能。

要想删除某一个元素只需要在mapper函数里面返回一个空的数组[], 而增加元素只需在mapper函数里面返回一个长度大于1的数组，具体可以看下面的例子：
```javascript
// 假如我们想要删除掉原数组里面所有的负数，同时将单数转换为一个复数和1
const a = [5, 4, -3, 20, 17, -33, -4, 18]
//        |\  \  x   |   | \   x   x   |
//       [4,1, 4,   20, 16,1,         18]
a.flatMap(n =>
  (n < 0) ? []: // 删除负数
  (n % 2 == 0) ? [n] : // 保留复数
                 [n - 1, 1] // 单数变为一个复数和1
)
// [4, 1, 4, 20, 20, 16, 1, 18]
```
## Object.fromEntries()
> The Object.fromEntries() method transforms a list of key-value pairs into an object. -- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)

fromEntries方法将一个[iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)对象返回的一系列键值对(key-value pairs)转换为一个object。先看一个简单的例子理解一下:
```javascript
// key-value pairs数组
const entriesArr = [['k1', 1], ['k2', 2]]
console.log(Object.fromEntries(entriesArr)
// {k1: 1, k2: 2}

const entriesMap = new Map([
  ['k1', 1],
  ['k2', 2]
]) // {"k1" => 1, "k2" => 2}
console.log(Object.fromEntries(entriesMap))
// {k1: 1, k2: 2}
```
再来看一个自定义的iterable对象例子深入理解一下:
```javascript
const iteratorObj = {
  [Symbol.iterator]: function () {
    const entries = [['k1', 1], ['k2', 2]]
    let cursor = 0

    return {
      next() {
        const done = entries.length === cursor
        
        return {
          value: done ? undefined : entries[cursor++],
          done
        }
      }
    }
  }
}
Object.fromEntries(iteratorObj) // {k1: 1, k2: 2}
```
这个方法有一个用途就是对object的key进行filter，举个例子:
```javascript
const studentMap = {
  student1: {grade: 80},
  student2: {grade: 50},
  student3: {grade: 100}
}
const goodStudentMap = Object.fromEntries(
  Object
    .entries(studentMap)
    .filter(([_, meta]) => meta.grade >= 60)
)
console.log(goodStudentMap)
// {student1: {grade: 80}, student3: {grade: 100}}
```
## String.prototype.trimStart
这个方法很简单，就是返回一个将原字符串开头的空格字符去掉的新的字符串，例子:
```javascript
const greeting = '    Hello world!  '
console.log(greeting.trimStart())
// 'Hello world! '
```
这个方法还有一个别名函数，叫做trimLeft，它们具有一样的功能。
## String.trimEnd
这个方法和trimStart类似，只不过是将原字符串结尾的空格字符去掉，例子:
```javascript
const greeting = '  Hello world!  '
console.log(greeting.trimEnd())
// ' Hello world!'
```
这个方法也有一个别名函数，叫做trimRight, 它们也具有一样的功能。

## Symbol.prototype.description
> The read-only description property is a string returning the optional description of Symbol objects. -- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/description)

ECMAScript2019给Symbol对象添加了一个可选的description属性，这个属性是个只读属性，看看例子:
```javascript
console.log(Symbol('desc').description)
// desc
console.log(Symbol.for('desc').description)
// desc

// 一些内置的Symbol也有这个属性
console.log(Symbol.iterator.description)
// Symbol.iterator

// 如果初始化时没有带description，这个属性会返回一个undefined，因为这样才说这个属性是可选的
console.log(Symbol().description)
// undefined

// 这个属性是只读的，不能被设置
Symbol.iterator.description = 'mess it'
console.log(Symbol.iterator.description)
// Symbol.iterator
```
这个新的属性只要是为了方便开发者调试，不能通过比较两个Symbol对象的description来确定这两个Symbol是不是同一个Symbol:
```javascript
var s1 = Symbol("desc")
var s2 = Symbol("desc")
console.log(s1.description === s2.description)
// true
console.log(s1 === s2)
// false
```
## try catch optional binding
ECMAScript2019之后，你写try...catch时如果没必要时可以不用声明error：
``` javascript
// ECMAScript2019之前，你一定要在catch里面声明error，否则会报错
try {
  ...
} catch (error) {

}
// 可是有时候，你确实用不到这个error对象，于是你会写这样的代码
try {
  ...
} catch (_) {
  ...
}

// ECMAScript2019后，你可以直接这样写了
try {
  ...
} catch {
  ...
}
```
虽然这个新属性可以让你省略掉error，可是我觉得开发者应该避免使用这个属性，因为在我看来所有的错误都应该被处理，至少应该被console.error出来，否则可能会有一些潜在的bug，举个例子：
```javascript
let testJSONObj
try {
  testJSONObj = JSON.prase(testStr)
} catch {
  testJSONObj = {}
}
console.log(testJSONObj)
```
以上代码中无论testStr是不是一个合法的JSON字符串，testJSONObj永远都是一个空对象，因为JSON.parse函数名写错了，而你又忽略了错误处理，所以你永远不会知道这个typo。
## 稳定的排序 Array.sort
ECMAScript2019后Array.sort一定是个稳定的排序。什么是稳定排序？所谓的稳定排序就是：假如没排序之前有两个相同数值的元素a[i]和a[j]，而且i在j前面，即i < j，经过排序后元素a[i]依然排在a[j]元素的前面，也就是说稳定的排序不会改变原来数组里面相同数值的元素的先后关系。看个例子：
```javascript
var users = [
  {name: 'Sean', rating: 14},
  {name: 'Ken', rating: 14},
  {name: 'Jeremy', rating: 13}
]
users.sort((a, b) => a.rating - b.rating)
// 非稳定的排序结果可能是
// [
//   {name: 'Jeremy', rating: 13}, 
//   {name: 'Ken', rating: 14}, 
//   {name: 'Sean', rating: 14}
// ]
// 虽然Sean和Ken具有同样的rating，可是非稳定的排序不能保证他们两个的顺序在排序后保持不变

// ECMAScript2019后，Array.sort将是一个稳定的排序，也就是说它可以保证Sean和Ken两个人的顺序在排序后不变
// [
//   {name: 'Jeremy', rating: 13}, 
//   {name: 'Sean', rating: 14}, 
//   {name: 'Ken', rating: 14}
// ]
```
## 改进Function.prototype.toString()
ECMAScript2019之前，调用function的toString方法会将方法体里面的空格字符省略掉，例如:
```javascript
function hello() {
  console.log('hello word')
}

console.log(hello.toString())
//'function hello() {\nconsole.log('hello word')\n}'
```
ECMAScript2019之后，要求一定要返回函数源代码（保留空格字符）或者一个标准的占位符例如native code，所以ECMAScript2019之后，以上的输出会变为：
```javascript
console.log(hello.toString())
//"function hello() {
//  console.log('hello word')
//}"
```