---
title: React Hook实践指南
tags:
  - React
  - Hook
---
在[React为什么需要Hook]()这篇文章中我们探讨了React开发团队为什么要为Function Component添加Hook的原因，在本篇文章中我将会为大家提供一份较为全面的React Hook实践指南，其中包括以下方面的内容：
* 什么是React Hook
* 常用Hook介绍
  * useState
  * useEffect
  * useRef
  * useCallback
  * useMemo
  * useContext
  * useReducer
* 自定义Hook
## 什么是React Hook
React Hook是React 16.8版本之后添加的新属性，用最简单的话来说，**React Hook就是一系列内置的或者用户自定义的函数，这些函数可以让Function Component可以具有和Class Component一样的状态管理（state management）和副作用（side effect management）等功能**。

## 常用Hook介绍
接下来我将会为大家介绍一些常用的Hook，对于每一个Hook，我都会覆盖以下这些方面的内容：
* 作用
* 用法
* 注意事项

### useState
#### 作用
`useState`理解起来非常简单，和Class Component的`this.state`一样，都是用来**管理组件状态的**。在React Hook没出来之前，Function Component也叫做Functional Stateless Component（FSC），这是因为Function Component每次执行的时候都会生成新的函数作用域所以同一个组件的不同渲染（render）之间是不能够共用一些状态的，因此开发者一旦需要在组件中引入状态就需要将原来的Function Component改成Class Component，这使得开发者的体验十分不好。`useState`这个Hook就是用来解决这个问题的，**它允许Function Component将自己的状态持久化到React运行时（runtime）的某个地方（memory cell），这样在组件每次重新渲染的时候都可以从这个地方拿到该状态，而且当该状态被更新的时候，组件也会重渲染**。

#### 用法
```javascript
const [state, setState] = useState(initialState)
```
useState函数接收一个initialState变量作为状态的初始值，返回值是一个数组。返回的数组的第一个元素代表当前state的最新值，而第二个元素是一个函数，这个函数是用来更新这个state的。这里要注意的是state和setState这两个变量的命名不是固定的，应该根据你业务的实际情况选择不同的名字，可以是`text`和`setText`，也可以是`width`和`setWidth`这类的命名。（对上面数组的解构赋值不熟悉的同学可以看下[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)的介绍）。

我们在实际开发中，一个组件可能不止一个state，如果组件有多个state，则可以在组件内部多次调用useState Hook，以下是一个简单的例子：
```jsx
import React, { useState } from 'react'

export default () => {
  const [counter, setCounter] = useState(0)
  const [text, setText] = useState('')

  const handleTextChange = (event: Event) => {
    setText(event.target.value)
  }

  return (
    <div>
      <div>
        <div>current counter is : {counter}</div>
        <button onClick={() => setCounter(counter + 1)}>
          Increase counter
        </button>
      </div>
      <div>
        <input onChange={handleTextChange} value={text}/>
      </div>
    </div>
  )
}
```
和Class Component的[this.setState](https://reactjs.org/docs/react-component.html#setstate) API类似，setCounter和setText都可以接收一个函数为参数，这个函数叫做updater，updater接收的参数是当前状态的最新值，返回值是下一个状态。例如上面的setCounter就可以改成接收一个函数作为参数：
```html
<button onClick={() => {
  setCounter(counter => counter + 1)
}}>
  Increase counter
</button>
```
由于每次组件渲染的时候useState的initialState都会被计算一次（虽然只被设置了一次），所以如果你的initialState的计算十分耗费计算资源的话，可能会影响页面的渲染性能，为了避免这个问题，useState允许你将一个函数作为useState的参数，这个函数只会在组件初次渲染的时候被调用，其返回值是initialState，示例代码如下：
```javascript
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props)
  return initialState
})
```

#### 注意事项
##### setState是全量替代
Function Component的setState和Class Component的this.setState函数的一个重要区别是`this.setState`函数是将设置的state浅归并（shallowly merge）到旧state的操作。而setState函数则是将新state直接替换旧的state。因此我们在编写Function Component的时候，就要合理划分state，避免将没有关系的状态放在一起管理，例如下面这个是不好的设计：
```jsx
const [state, setState] = useState({ left: 0, top: 0, width: 0, height: 0 })
```
在上面的代码中，由于我们将关于位置的信息left和top和关于容器大小的信息width和height绑定在同一个state了，所以我们在更新容器大小信息的时候也要维护一下关于位置信息的状态：
```jsx
const handleContainerResize = ({ width, height }) => {
  setState({...state, width, height})
}
```
这种写法十分不方便而且容易引发bug，更加合理的做法应该是将位置信息的状态和关于容器大小的状态放在两个不同的state里面，这样可以避免更新某个状态的时候要手动维护另一个状态的信息：
```jsx
const [position, setPosition] = useState({ left: 0, top: 0 })
const [size, setSize] = useState({ width: 0, height: 0})

const handleContainerResize = ({ width, height }) => {
  setSize({width, height})
}
```
如果你确实有需要将多个不同的数据放在一起的话，可以考虑使用useReducer来管理你的状态。

#### 设置相同的state时setState会[bailing out of update](https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update)
如果setState接收到的新的state和当前的state是一样的（判断方法是[Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Description)），React将不会重新渲染子组件或者触发side effect。不过React还是可能会重新render当前的组件的，只不过它不会继续进行下一步操作而已，如果你的组件渲染有些很耗性能的计算的话，可以考虑使用useMemo hook来优化性能。

##### setState没有回调函数
无论是useState还是Class Component的this.setState API都是**异步调用**的，也就是说每次组件调用完它们之后都不能拿到最新的state值。为了解决这个问题，Class Component的th从而可以拿到最新的state值。
```jsx
this.setState(newState, state => {
  console.log("I get new state", state)
})
```
而setState不存在这么一个可以拿到最新state的回调函数，不过可以使用useEffect hook来实现相同的效果，具体可以参见StackOverflow的这个[讨论](https://stackoverflow.com/questions/54954091/how-to-use-callback-with-usestate-hook-in-react)。

### useEffect Hook
#### 作用
Hook的另外一个作用是让Function Component也可以进行副作用（Side Effect），而让Function Component也可以进行副作用的Hook就是`useEffect Hook`。那么什么是副作用呢？我们可以先来看看维基百科的定义：
> In computer science, an operation, function or expression is said to have a side effect if it modifies some state variable value(s) outside its local environment, that is to say has an observable effect besides returning a value (the main effect) to the invoker of the operation.

通俗来说，**函数的副作用就是函数除了返回值外对外界环境造成的其它影响**。举个例子，假如我们每次执行一个函数，该函数都会操作全局的一个变量，那么对全局变量的操作就是这个函数的副作用。而在React的世界里，我们的副作用大体可以分为两类，一类是**调用浏览器的API**，例如使用`addEventListener`来添加事件监听函数等，另外一类是**发起获取服务器数据的请求**，例如当用户卡片挂载的时候去异步获取用户的信息等。在Hook出来之前，我们要在组件进行副作用的话，需要将组件写成Class Component，然后在组件的生命周期函数里面写副作用，这其实会引起很多代码设计上的问题，具体大家可以查看我的上篇文章[React为什么需要Hook]()。Hook出来之后，开发者就可以直接使用`useEffect`这个Hook来在Function Component里面定义副作用了。useEffect Hook基本可以覆盖`componentDidMount`， `componentDidUpdate`，`componentWillUnmount`等生命周期函数组合起来使用的所有场景，甚至一些[很少出现的情况](https://reactjs.org/docs/hooks-faq.html#can-i-run-an-effect-only-on-updates)也覆盖了。虽然是这样，useEffect的设计理念和生命周期函数的设计理念还是存在本质上的区别的，如果一味用生命周期函数的思考方式去理解和使用useEffect的话，可能会引发一些奇怪的问题，大家有兴趣的话，可以看看React核心开发Dan写的这篇文章：[A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)，里面阐述了使用useEffect的一个比较正确的思考方式（mental model）。

#### 用法
```javascript
useEffect(effect, deps?)
```
useEffect的第一个参数effect是要执行的副作用函数，它可以是任意的用户自定义函数，用户可以在这个函数里面操作一些浏览器的API或者和外部环境进行交互，这个函数会在**每次组件渲染完成之后**被调用，例如下面是一个简单的例子：
```javascript
import React, { useState, useEffect } from 'react'

export default ({ userId }) => {
  const [userDetail, setUserDetail] = useState({})

  useEffect(() => {
    fetch(`https://myapi/users/${userId}`)
      .then(response => response.json())
      .then(user => setUserDetail(userDetail))
  })

  return (
    <div>
      <div>User Name: ${userDetail.name}</div>
    </div>
  )
}
```
上面定义的获取用户详情信息的副作用会在这个组件每次**完成渲染后**执行，所以当该组件第一次挂载的时候就会向服务器发起获取用户详情信息的请求然后更新userDetail state的值，这里的第一次挂载我们可以想象成`componentDidMount`的作用。可是如果试着运行一下上面的代码的话，你会发现代码进入了死循环：组件会不断向服务端发起请求。出现这个死循环的原因是`useEffect`函数里面调用了`setUserDetail`，这个函数会更新`userDetail`的值，从而使组件重渲染，而重渲染后`useEffect`的函数继续被执行，进而组件再次重渲染。。。为了避免重复的副作用执行，`useEffect`允许你通过`dependencies`这个参数来指明该副作用什么时候被执行，指明了`dependencies`的副作用，只有在`dependencies`的数值发生变化时才会被执行，因此如果要避免上面的代码进入死循环我们就要将`userId`指定为我们定义的副作用的`dependencies`：
```javascript
import React, { useState, useEffect } from 'react'

export default ({ userId }) => {
  const [userDetail, setUserDetail] = useState({})

  useEffect(() => {
    fetch(`https://myapi/users/${userId}`)
      .then(response => response.json())
      .then(user => setUserDetail(userDetail))
  }, [userId])

  return (
    <div>
      <div>User Name: ${userDetail.name}</div>
    </div>
  )
}
```
除了发起服务端的请求外，我们往往需要在`useEffect`里面调用浏览器的API，例如使用`addEventListener`来添加事件的监听器等。我们一旦使用了`addEventListener`就必须在合适的时候调用`removeEventListener`来移除对事件的监听，否则会对性能问题，`useEffect`允许我们在自定义的副作用函数里面返回一个cleanup函数，这个函数会在每次组件**重新渲染之前**被执行，我们可以在这个返回的函数里面移除对事件的监听函数，下面是一个具体的例子：
```javascript
import React, { useEffect } from 'react'

export const default () => {
  useEffect(() => {
    const handleWindowScroll = () => console.log('yean, window is scrolling!')
    window.addEventListener('scroll', handleWindowScroll)

    // this is clean up function
    return () => {
      window.removeEventListener(handleWindowScroll)
    }
  }, [])

  return (
    <div>
      non-sense rendering
    </div>
  )
}
```
上面的代码中我们会在组件首次渲染完成后注册一个监听页面滚动事件的函数，并在组件下一次渲染前移除该监听函数。由于我们制定了一个空数组作为这个副作用的`dependencies`，所以这个副作用只会在组件首次渲染后被执行一次，而且它的cleanup函数只会在组件`unmount`时才被执行，这就避免了频繁注册页面监听函数影响页面的性能。

#### 注意事项
##### 避免使用“旧的”变量
我们在实际使用`useEffect` Hook的过程中可能遇到最多的问题就是我们的effect函数被调用的时候，拿到的某些state, props或者是变量不是**最新**的变量而是之前**旧的**变量。出现这个问题的原因是：我们定义的副作用其实就是一个函数，而JS的作用域是词法作用域，所以它里面使用到的变量的值是它被**定义时**就确定的，用最简单的话来说就是，useEffect的effect会**记住**它被定义时的外部变量的值，所以它被调用时使用到的值可能不是**最新**的值。解决这个问题的办法有两种，一种是将那些你希望每次effect被调用时拿到的都是最新值的变量保存在一个ref里面，并且在每次组件渲染的时候更新该ref的值：
```javascript
const [someState, setSomeState] = useState()
const someStateRef = useRef()

someStateRef.current = someState

useEffect(() => {
  ...
  const latestSomeState = someStateRef.current
  console.log(latestSomeState)
}, [otherDependencies...])
```
这种做法虽然不是很优雅，不过可以解决我们的问题，如果你没有了解过useRef的用法的话，可以查看本篇文章`useRef`这部分的内容。解决这个问题的另外一个做法是将副作用**使用**到的所有变量都加到effect的dependencies中去，这个可以使用facebook自家的[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks#installation)的[exhaustive-deps](https://github.com/facebook/react/issues/14920)规则来进行编码约束，如果你的代码启动了这个规则之后，在代码开发阶段eslint就会告诉你要将someState放到useEffect的dependencies中去，这样就可以不使用useRef才存储someState的值：
```javascript
const [someState, setSomeState] = useState()

useEffect(() => {
  ...
  console.log(someState)
}, [otherDependencies..., someState])
```
### useRef
#### 作用
`useRef` hook用来在Function Component的生命周期中持久化一些变量用的。之前我们在使用Class Component的时候可以将需要持久化的变量绑定在类实例（this）上面，Function Component没有类实例，所以`useRef` hook就被用来存储哪些需要在同一个组件不同渲染之间公用的数据。
#### 用法
```javascript
const persistedValueContainer = useRef(initialValue)
```
`useRef`接收一个`initialValue`作为需要被持久化的数据的初始值，然后返回一个`ref`对象，这个对象的`.current`属性就是该数据的最新值。使用`useRef`的一个最简单的情况就是在Function Component里面持久化DOM的引用，例如下面这个例子：
```javascript
import { useRef, useEffect } from 'react'

export default () => {
  const inputRef = useRef(null)

  useEffect(() => {
    // auto focus when component mount
    inputRef.current.focus()
  }, [])

  return (
    <div>
      <input ref={inputRef} type='text' />
    </div>
  )
}
```
在上面代码中inputRef其实就是一个`{current: xxx}`的Object，只不过它可以在保证在组件每次渲染的时候拿到的都是同一个对象。
##### 注意事项
`useRef`返回的ref object被重新赋值的时候不会引起组件的**重渲染**，如果你有这个需求的话请使用`useState` hook。
### useCallback
#### 作用
随着Hook的出现，开发者越来越多地开始使用Function Component来开发需求。当开发者在定义Function Component的时候往往需要在函数体内定义一些内嵌的函数（inline function），这些内嵌的函数会在每次Function Component重新渲染的时候被重新定义，如果它们作为props传递给了子组件的话，即使其它props的值没有发生变化，它都会使子组件重新渲染，如果子组件的渲染是一个十分消耗性能的（expensive）行为的话就会出现性能问题。另外如果我们定义的函数被作为`dependency`传进`useEffect`的`dependencies`数组的话，因为该函数频繁被重新生成，所以`useEffect`里面的effect就会频繁被处罚。为了解决这些问题，React允许我们使用`useCallback`来在不同的渲染中持久化对定义的函数进行持久化，这样就可以在不同的渲染里面使用同一个函数了。
#### 用法
```javascript
const memoizedCallback = useCallback(callback, deps)
```
`useCallback`接收两个参数，第一个参数是需要持久化的callback函数，第二个参数叫`dependencies`，它指明`callback`的依赖，只有`dependencies`数组里面的元素的值发生变化时`useCallback`才会存储并返回新的callback。下面是一个简单的例子：
```javascript
```

## 参考文献
* [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)