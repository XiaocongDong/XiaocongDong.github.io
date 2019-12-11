---
title: JavaScript小技巧 - 数组篇
tags: JavaScript
date: 2019-12-11 17:32:16
---

本文整理了一些在日常工作可以用到的JavaScript数组小技巧
# 去重
巧用Set特性
```javascript
const arr = [1, 2, 2, 3, 4, 7, 7]
const uniqueArr = [...new Set(arr)]
console.log(uniqueArr)
// [1, 2, 3, 4, 7]
```
# 某一个位置插入元素
改变原数组
```javascript
const arr = [1, 2, 3, 5, 6, 7]
arr.splice(3, 0, 4)
console.log(arr)
// [1, 2, 3, 4, 5, 6, 7]
```
不改变原数组
```javascript
const arr = [1, 2, 4, 5]
const indexNeededToInsert = 2
const newArr = [...arr.slice(0, indexNeededToInsert), 3, ...arr.slice(indexNeededToInsert)]

console.log(newArr)
// [1, 2, 3, 4, 5]
console.log(arr)
// [1, 2, 4, 5]
```
# 删除某一个位置的元素
不改变原数组
```javascript
const arr = [1, 2, 3, 4, 5]
const indexToBeRemoved = 3
const filteredArr = arr.filter((_, index) => index !== indexToBeRemoved)
console.log(filteredArr)
// [1, 2, 3, 5]
console.log(arr)
// [1, 2, 3, 4, 5]
```
改变原数组
```javascript
const arr = [1, 2, 3, 4, 5]
const indexToBeRemoved = 3
arr.splice(indexToBeRemoved, 1)
console.log(arr)
// [1, 2, 3, 5]
```
# 获取数组最后一个元素
改变原数组
```javascript
const arr = [1, 2, 3, 4, 5]
const lastElement = arr.pop()
console.log(lastElement)
// 5
console.log(arr)
// [1, 2, 3, 4]
```
不改变原数组
```javascript
const arr = [1, 2, 3, 4, 5]
const lastElement = arr.slice(-1)[0]
console.log(lastElement)
// 5
console.log(arr)
// [1, 2, 3, 4, 5]
```
[slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)第一个参数如果是负数表示从后面开始数起的第几个元素，-1表示倒数第一个元素。
# 清空数组
```javascript
const arr = [1, 2, 3, 4, 5]
arr.length = 0
console.log(arr)
// []
console.log(arr[0])
// undefined
```
# 生成一定长度的数组
```javascript
const newArr = new Array(10)
console.log(newArr)
// [ <10 empty items> ]
```
# 两个数组的交集
```javascript
const arr1 = [1, 2, 3, 4]
const arr2 = [2, 3]
const intersectedArr = arr1.filter(item1 => arr2.includes(item1))
console.log(intersectedArr)
// [2, 3]
```
# 合并多个数组
```javascript
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]
const arr3 = [7, 8, 9]
const mergedArr = [...arr1, ...arr2, ...arr3]
console.log(mergedArr)
// [1, 2, 3, 4, 5, 6, 7, 8, 9]
```
# 移除数组的虚假(falsy)值
```javascript
const mixedArr = [0, “blue”, “”, NaN, 9, true, undefined, “white”, false]
const trueArr = mixedArr.filter(Boolean);
console.log(trueArr)
// [“blue”, 9, true, “white”]
```
# 求和
```javascript
const nums = [1, 2, 3, 4, 5]
const sum = nums.reduce((currSum, num) => currSum + num)
console.log(sum)
// 15
```
