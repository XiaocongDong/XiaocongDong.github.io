---
title: React Hook测试指南
tags:
  - testing
  - react
  - hook
categories:
  - 前端
thumbnail: /gallery/thumbnails/react-hook.jpg
date: 2020-07-22 14:15:38
---

在[React为什么需要Hook](https://superseany.com/2020/04/29/React%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81Hook/)中我们探讨了React为什么需要引入Hook这个属性，在[React Hook实战指南](https://superseany.com/2020/07/15/React-Hook%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)中我们深入了解了各种Hook的详细用法以及会遇到的问题，在本篇文章中我将带大家了解一下如何通过为自定义hook编写单元测试来提高我们的代码质量，它会包含下面的内容：
* 什么是单元测试
  * 单元测试的定义
  * 为什么需要编写单元测试
  * 单元测试需要注意什么
* 如何对自定义Hook进行单元测试
  * Jest
  * React-hooks-testing-library
  * 例子

<!-- more -->

## 什么是单元测试
### 单元测试的定义
要理解单元测试，我们先来给测试下个定义。用最简单的话来说测试就是：**我们给被测试对象一些输入（input），然后看看这个对象的输出结果（output）是不是符合我们的预期（match with expected result）**。而在软件工程里面有很多不同类型的测试，例如单元测试（unit test），功能测试（functional test），性能测试（performance test）和集成测试（integration test）等。不同种类的测试的主要区别是被测试的对象和评判指标不一样。对于单元测试，被测试的对象是我们源代码的`独立单元`（individual unit），在面向过程编程语言（procedural programming）里面，单元就是我们封装的方法（function），在面向对象的编程语言（object-oriented programming）里面单元是类（class）的方法（method），我们一般不推荐将某个类或者某个模块直接作为单元测试的单元，因为这会使被测试的逻辑过于庞大，而且问题出现时不容易进行定位。

### 为什么需要编写单元测试
了解了单元测试的定义后，我们再来探讨一下为什么我们要在代码里面进行单元测试。

我们之所以要在项目中编写单元测试，主要是因为对代码进行单元测试有下面这些好处：
#### 提高代码质量
单元测试可以提高我们的代码质量主要体现在它可以在我们开发某个功能的时候**提前帮我们发现自己编写的代码的bug**。举个例子，假如A同学写了一个叫做`useOptions`的hook它接受一个叫做`options`的参数，这个参数既可以是一个对象也可以是一个数组。A同学自己开发的过程中他只试过给`useOptions`传对象而没有试过给它传数组。同一个项目的B同学在使用`useOptions`的时候给它传了个数组发现代码挂了，这个时候B同学就得找A同学确认并等待A同学修复这个问题，这不但会影响B同学的开发进度而且还会让B同学觉得A同学`不靠谱`，或者觉得A同学的`代码很烂`。如果A同学有对`useOptions`进行单元测试的话，这个`悲剧`可能就不会发生了，因为A同学在为`useOptions`编写单元测试的时候就考虑了`options`为数组的情况，并且在B同学使用之前就修复了这个问题。因此编写单元测试可以让我们在开发的过程中提前考虑到很多后面使用才会发现的问题，进而提高我们的代码质量。

#### 方便代码重构和新功能添加
编写单元测试的过程其实是我们给代码编写`使用说明书的过程`（specification）。这个`使用说明书`十分重要，它相当于`代码生产者`（producer）与`代码消费者`（consumer）之间的`合约`（contract），生产者需要保证**在消费者使用代码没错的前提下**代码要有`使用说明书`上面的效果。这其实会对代码生产者起到一定的制约作用，因为生产者必须保证无论是给原来的代码添加新的功能还是对它进行重构，它都要满足原来`使用说明书`上的要求。

继续上面那个例子，A同学和B同学都在项目的`1.0.0`版本中使用了`useOptions`这个hook，虽然`useOptions`没有编写单元测试，可是代码是没有bug的（最起码没有被发现）。后面项目需要进行`2.0.0`版本的升级了，这时候A同学需要为`useOptions`添加新的功能，A同学在改动了`useOptions`的代码后，在自己使用到的地方（对象作为参数的地方）做了测试，没有发现bug。在A同学自测完代码后，并将这个更改集成（integration）到了项目的`master`分支上。后面B同学在更新完A同学的代码后，发现自己的代码出现了一些问题，这个时候B同学很可能就会手忙脚乱，并且可能需要花费一段时间才能定位到原来是A同学对`useOptions`的改动影响到他的功能，这除了会影响到项目的进度外还会让A同学和B同学的关系进一步恶化。这个悲剧同样也是可以通过编写单元测试来避免的，试想一下假如A同学有给`useOptions`编写配套的`使用说明书`（单元测试），A同学在改动完代码后，它的代码是通过不了`使用说明书`的检查的，因为它的改动改变了`useOptions`之前定义好的外部行为，这个时候A同学就会提前修复自己的代码进而避免了B同学后面的苦恼。通过这个例子大家可能还是没有体会到单元测试对于我们平时产品迭代或者代码重构的重要性，可是你试想一下在一个比较大的项目中是有很多个A同学和B同学的，也有成千上万个`useOptions`函数，当真的发生类似问题的时候bug将会更难被定位和修复，如果我们大部分的代码都有单元测试的话，无论是对代码增加新的功能还是对原来的代码进行重构我们都会更有信心。

#### 完善我们代码的设计
在软件工程里面有个概念叫做`测试驱动开发`（Test-driven Development），它鼓励我们在**实际开始编码之前先为我们的代码编写测试用例**。这样做的目的是让我们在开发之前就以`代码使用者`的角度去评判我们的代码设计。如果我们的代码设计很糟糕，我们就会发现我们很难为它们编写详尽的单元测试用例，相反如果我们的代码设计得很好（低耦合高内聚），各个函数的参数和功能都设计得十分合理，我们就十分容易就为它们编写对应的单元测试。我们要记住一句话：**高质量的代码一定是可以被测试的（testable）**。那么为什么是在还没开始写代码之前就编写测试用例呢？这是因为如果我们在代码写完之后再编写测试的话，即使我们发现代码设计得再不合理，我们也没有动力去改了，因为对设计的改动可能会让我们重写所有的代码，所以我们需要在实际编码之前进行单元测试的编写，因为这个时候的`改代码阻力`是最小的。

#### 提供文档功能
我们在为代码编写单元测试的时候实际上是在为代码编写一个个`使用例子`，因此别的开发者在使用我们代码的时候可以通过我们的单元测试来快速掌握我们定义的各种函数的用法。另外教大家一个实用的技巧：如果我们发现某个库的文档不是很全面的话，可以通过查看这个库的单元测试来快速掌握这个库的用法。

### 单元测试需要注意的问题
#### 隔离性
上面我们说到单元测试是对代码独立的单元进行测试，这个独立的意思不是说这个函数（单元）不会调用另外一个函数（单元），而是说我们在测试这个函数的时候如果它有调用到其它的函数我们就需要mock它们，从而将我们的测试逻辑**只放在被测试函数的逻辑上**，不会受到其它依赖函数的影响。举个例子我们现在要测试以下函数：
```javascript
async function fetchUserDetails(userId) {
  const userDetail = await fetch(`https://myserver.com/users/${userId}`)
  return userDetail
}
```
在测试`fetchUserDetails`时我们就需要mock `fetch`这个函数了，因为我们现在测试的函数是`fetchUserDetails`，我们只需要确定在外界调用`fetchUserDetails`的时候`fetch`会被调用，并且调用的参数是`“https://myserver.com/users/${userId}”`就行了，至于`fetch`函数如何发请求和处理返回来的数据都是`fetch`函数自己的事，我们不应该在测试`fetchUserDetails`的时候关心这个问题。

单元测试要注意隔离性的另外一个原因是它可以保证当测试案例失败的时候我们可以十分容易定位到问题的所在。以上面的代码为例，如果我们没有mock `fetch`函数，一旦我们的测试失败，我们很难分清是`fetchUserDetails`逻辑错了还是`fetch`的逻辑错了。

#### 可重复性
我们编写的所有单元测试用例一定不能依赖外部的运行环境，否则我们的单元测试将不具备`可重复性`（repeatable）。所谓的`可重复性`就是：如果我们的单元测试用例现在是可以通过的，那么**在代码不发生变动和测试用例没有改变的前提下**它将是一直可以通过的。举个测试用例不具备可重复性的例子，假如你将项目的单元测试数据全部放在数据库里面，你今天运行项目的测试用例是可以通过的，而第二天其他人无意改了数据库的数据，这个时候你的测试用例就通过不了了，我们就说这些测试用例不具备可重复性，出现这个问题的主要原因是`它们使用了外部的依赖作为测试条件`。由此可见要使我们的测试用例具备可重复性的一个关键点是在编写单元测试的时候避免外部依赖，这些外部依赖包括`数据库`，`网络请求`和`本地文件系统`等。

另外一个影响到测试用例可重复性的一个重要的却容易被忽略的因素是：不同单元测试用例之间共用了一些测试数据，某个测试用例对测试数据的更改可能会影响其它测试用例的正确执行。因此我们在编写单元测试用例的时候一定要**避免不同测试用例之间共用一些测试数据**，尽量将每个测试用例`隔离`起来。

#### 提高代码覆盖率
在单元测试里面有个概念叫做代码覆盖率（test coverage），它表明我们代码`被测试的程度`。举个例子假如我们有一个100行的函数，在我们运行完所有的为这个函数编写的单元测试用例之后，如果测试框架告诉我们这个函数的覆盖率是80%，这表明我们的测试用例代码只覆盖了这个函数的80行代码，还有一些代码分支（if/else, switch, while）没有被执行到。如果我们想通过单元测试来提高我们代码质量的话，我们就需要保证我们代码的覆盖率足够大，尽量让被测试的函数的每一种被执行情况都被覆盖到（覆盖率100%），特别是一些异常的情况应该也要被覆盖到（例如参数错误，调用第三方依赖报错等），这样我们才能及早地发现代码的bug并进行修复。

#### 测试用例运行时间要短
我在上面说到单元测试是可以帮助我们更好地进行代码迭代和重构的，要做到这点其实要求我们在每次代码归并的时候对被`merge`的代码进行一些自动化检测（CI），这就包括项目单元测试用例的运行。试想一下在一个比较大型的项目里面单元测试用例的数量往往是很多的，少则几百个，多则上千个，如果全部运行所有测试用例的时间需要十几分钟甚至一两小时，这就会影响到代码集成的进度。为了避免这个问题，我们就需要确保每个单元测试用例执行的时间不能过长，例如避免在测试代码里面进行一些耗时的计算等。

## 如何对自定义Hook进行单元测试
在[React Hook实战指南](https://superseany.com/2020/07/15/React-Hook%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)中我们提到Hook就是一些函数，所以对Hook进行单元测试其实是对一个函数进行测试，只不过这个函数和普通函数的区别是它拥有React给它赋予的特殊功能。在讲如何对Hook进行测试之前我们先来了解一下我们要用到的测试框架[Jest](https://jestjs.io/)和hook测试库[react-hook-testing-library](https://github.com/testing-library/react-hooks-testing-library)。
### Jest
Jest是Facebook开源的一个单元测试框架，它的使用率和知名度都非常高，一些著名的开源项目例如webpack, babel和react等都是使用Jest来进行单元测试的，由于这篇文章的重点不是Jest的使用，所以我在这里将不为大家做具体的介绍，这里主要介绍一下我们常用到的Jest API：
#### 常用API
##### it/test
`it/test`函数是用来定义`测试用例`（test case）的，它的函数签名是`it(description, fn?, timeout?)`，`description`参数是对这个测试用例的一个简短的描述，`fn`是一个运行我们实际测试逻辑的函数，而timeout则是这个测试用例的超时时间。下面是一个简单的例子：
```javascript
import sum from 'somewhere/sum'

it('test if sum work for positive numbers', () => {
  const result = sum(1, 2)
  expect(result).toEqual(3)
})
```
##### describe
`describe`函数是用来给测试用例`分组`用的，它的函数签名是`describe(description, fn)`，description是用来描述这个分组的，而`fn`函数里面则可以定义内嵌的分组（nested）或者是一些测试用例（it），下面是一个简单的例子：
```javascript
import sum from 'somewhere/sum'

describe('test sum', () => {
  it('work for positive numbers', () => {
    const result = sum(1, 2)
    expect(result).toEqual(3)
  })

  it('work for negative numbers', () => {
    const result = sum(-1, -2)
    expect(result).toEqual(-3)
  })
})
```
##### expect
我们在刚开始的时候就提到所谓的测试就是要**比较被测试对象的输出和我们期待的输出是不是一致的**，也就涉及到一个比较的过程，在Jest框架中我们可以通过`expect`函数来访问一系列`matcher`来进行这个`比较的过程`，例如上面的`expect(sum).toEqual(3)`就是一个用matcher来判断输出结果是不是我们想要的值的过程。关于更加详细的matcher信息大家可以参考[jest的官方文档](https://jestjs.io/docs/en/expect)。
##### mock
在Jest框架中用来进行mock的方法有很多，主要用到的是`jest.fn()`和`jest.spyOn()`。
##### jest.fn
`jest.fn`会生成一个mock函数，这个函数可以用来代替源代码中被使用的第三方函数。`jest.fn`生成的函数上面有很多属性，我们也可以通过一些`matcher`来对这个函数的调用情况进行一些断言，下面是一个简单的例子：
```javascript
// somewhere/functionWithCallback.js
export const functionWithCallback = (callback) => {
  callback(1, 2, 3)
}

// somewhere/functionWithCallback.spec.js
import { functionWithCallback } from 'somewhere/functionWithCallback'

describe('Test functionWithCallback', () => {
  it('if callback is invoked', () => {
    const callback = jest.fn()
    functionWithCallback(callback)

    expect(callback.mock.calls.length).toEqual(1)
  })
})
```
##### jest.spyOn
我们源代码中的函数可能使用了另外一个文件或者`node_modules`中安装的一些依赖，这些依赖可以使用`jest.spyOn`来进行mock，下面是一个简单的例子：
```javascript
// somewhere/sum.js
import { validateNumber } from 'somewhere/validates'

export default (n1, n2) => {
  validateNumber(n1)
  validateNumber(n2)

  return n1 + n2
}

// somewhere/sum.spec.js
import sum from 'somewhere/sum'
import * as validates from 'somewhere/validates'

it('work for positive numbers', () => {
  // mock validateNumber
  const validateNumberMock = jest.spyOn(validates, 'validateNumber')
  
  const result = sum(1, 2)
  expect(result).toEqual(3)

  // restore original implementation
  validateNumberMock.mockRestore()
})
```
我们在上面测试代码中引入了源代码使用到的依赖`somewhere/validates`，这个时候就可以通过`jest.spyOn`来mock这个依赖`export`的一些方法了，例如`validateNumber`。被mock的函数会在源代码被执行的时候使用，例如上面`sum`执行的时候使用到的`validateNumber`就是我们在`sum.spec.js`里面定义的`validateNumberMock`。这样我们除了可以保证`validateNumber`不会影响到我们对`sum`函数逻辑的测试，还可以在外面对`validateNumberMock`进行一些断言（assertion）来验证`sum`逻辑的正确性。还有一点需要注意的是，我在测试用例执行完之后调用了`mockRestore`这个函数，这个函数会恢复`validateNumber`函数原来的实现，从而避免这个测试用例对`validate`文件的更改影响到其它测试用例的正确执行。

### 项目引入jest
了解完jest的一些基本API之后我们再来看一下如何在我们的项目里面引入jest。
#### 安装依赖
首先使用下面命令安装jest
```shell
yarn add -D jest
```
如果你项目使用的是Typescript，则还需要安装`ts-jest`作为依赖：
```
yarn add -D ts-jest
```
#### 配置jest
安装完jest后需要在package.json文件里面配置一下:
```json
{ 
  "jest": {
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleDirectories": [
      "node_modules",
      "src"
    ],
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ]
  }
}
```
上面各个配置项的意思分别是：
* transform: 告诉jest，你的ts或者tsx文件需要使用ts-jest来进行转换。
* testRegex: 告诉jest哪些文件是需要被作为测试代码进行执行的，从上面的正则表达式我们可以看出文件名中有test和spec的文件将会被作为测试用例执行。
* moduleDirectories: 告诉jest在执行测试用例代码的时候，代码用到的dependencies应该去哪些目录进行resolve，在这里jest会去`node_modules`和`src`（或者你自己的源代码根目录）里面进行resolve，这个应该要和你项目的webpack.config.js的resolve部分配置保持一致。
* moduleFileExtensions: 告诉jest在找不到对应文件的时候应该尝试哪些文件后缀。

### React hooks testing library
[React-hooks-testing-library](https://github.com/testing-library/react-hooks-testing-library)，是一个专门用来测试React hook的库。我们知道虽然hook是一个函数，可是我们却不能用测试普通函数的方法来测试它们，因为它们的实际运行会涉及到很多React运行时（runtime）的东西，因此很多人为了测试自己的hook会编写一些`TestComponent`来运行它们，这种方法十分不方便而且很难覆盖到所有的情景。为了简化开发者测试hook的流程，React社区有人开发了这个叫做`react-hooks-testing-library`的库来允许我们像测试普通函数一样测试我们定义的hook，这个库其实背后也是将我们定义的hook运行在一个`TestComponent`里面，只不过它封装了一些简易的API来简化我们的测试。在开始使用这个库之前，我们先来看一下它对外暴露的一些常用的API。
#### 常用API
##### renderHook
`renderHook`这个函数顾名思义就是用来渲染hook的，它会在调用的时候渲染一个专门用来测试的`TestComponent`来使用我们的hook。renderHook的函数签名是`renderHook(callback, options?)`，它的第一个参数是一个`callback`函数，这个函数会在`TestComponent`每次被重新渲染的时候调用，因此我们可以在这个函数里面调用我们想要测试的hook。`renderHook`的第二个参数是一个可选的`options`，这个`options`可以带两个属性，一个是`initialProps`，它是`TestComponent`的初始props参数，并且会被传递给`callback`函数用来调用hook。options的另外一个属性是`wrapper`，它用来指定`TestComponent`的父级组件（Wrapper Component），这个组件可以是一些`ContextProvider`等用来为`TestComponent`的hook提供测试数据的东西。

`renderHook`的返回值是`RenderHookResult`对象，这个对象会有下面这些属性：
* result：`result`是一个对象，它包含两个属性，一个是`current`，它保存的是`renderHook` `callback`的返回值，另外一个属性是`error`，它用来存储hook在render过程中出现的任何错误。
* rerender: `rerender`函数是用来重新渲染`TestComponent`的，它可以接收一个newProps作为参数，这个参数会作为组件重新渲染时的props值，同样`renderHook`的`callback`函数也会使用这个新的props来重新调用。
* unmount: `unmount`函数是用来卸载`TestComponent`的，它主要用来覆盖一些`useEffect cleanup`函数的场景。

##### act
这函数和React自带的test-utils的[act函数](https://reactjs.org/docs/test-utils.html#act)是同一个函数，我们知道组件状态更新的时候（setState），组件需要被重新渲染，而这个重渲染是需要React进行调度的，因此是个异步的过程，我们可以通过使用`act`函数将所有会更新到组件状态的操作封装在它的`callback`里面来保证`act`函数执行完之后我们定义的组件已经完成了重新渲染。

### 安装
直接把`react-hooks-testing-library`作为我们的项目`devDependencies`：
```shell
yarn add -D @testing-library/react-hooks
```
注意：要使用`react-hooks-testing-library`我们要确保我们安装了`16.9.0`版本及其以上的`react`和`react-test-renderer`：
```
yarn add react@^16.9.0
yarn add -D react-test-renderer@^16.9.0
```
## 例子
现在就让我们看一个简单的同时使用`Jest`和`react-hooks-testing-library`来测试hook的例子，假如我们在项目里面定义了一个叫做`useCounter`的Hook:
```javascript
// somewhere/useCounter.js
import { useState, useCallback } from 'react'

function useCounter() {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => setCount(x => x + 1), [])
  const decrement = useCallback(() => setCount(x => x - 1), [])

  return {count, increment, decrease}
}
```
在上面的代码中我定义了一个叫做`useCounter`的hook，这个hook是用来封装一个叫做count的状态并且对外暴露对count进行操作的一些updater包括`increment`和`decrement`。如果大家对`useState`和`useCallback`不够熟悉的话可以看一下我的上一篇文章[React Hook实战指南]()。接着就让我们编写这个hook的测试用例：

```javascript
// somewhere/useCounter.spec.js
import { renderHook, act } from '@testing-library/react-hooks'
import useCounter from 'somewhere/useCounter'

describe('Test useCounter', () => {
  describe('increment', () => {
     it('increase counter by 1', () => {
      const { result } = renderHook(() => useCounter())

      act(() => {
        result.current.increment()
      })

      expect(result.current.count).toBe(1)
    })
  })

  describe('decrement', () => {
    it('decrease counter by 1', () => {
      const { result } = renderHook(() => useCounter())

      act(() => {
        result.current.decrement()
      })

      expect(result.current.count).toBe(-1)
    })
})
})
```
上面的代码中我们写了一个测试大组（describe）`Test useCounter`并在这个大组里面定义了两个测试小组分别用来测试`useCounter`返回的`increment`和`decrement`方法。我们具体看一下描述为`increase counter by 1`的测试用例的代码，首先我们要用`renderHook`函数来渲染要被测试的hook，这里我们需要将`useCounter`的返回值作为`callback`函数的返回值，这是因为我们需要在外面拿到这个hook的返回结果`{count, increment, decrement}`。接着我们使用`act`函数来调用改变组件状态`count`的`increment`函数，`act`函数完成之后我们的组件也就完成了重渲染，后面就可以判断更新后的`count`是不是我们想要的结果了。

## 总结
在本篇文章中我给大家介绍了什么叫做单元测试，为什么我们需要在自己的项目里面引入单元测试以及教大家如何使用`Jest`和`react-hooks-testing-library`来测试我们自定义的hook。

这篇文章是我的React hook系列文章的最后一篇了，后面我还会持续为大家分享一些和hook相关的内容，大家敬请期待。

## 参考文献
* https://jestjs.io/
* https://react-hooks-testing-library.com/

## 个人技术动态
欢迎关注公众号**进击的大葱**一起学习成长
![](/images/wechat_qr.jpg)
