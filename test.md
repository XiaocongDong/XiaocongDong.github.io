在[React为什么需要Hook](https://juejin.im/post/5ea9015be51d454dd15ef310)这篇文章中我们探讨了React开发团队为什么要为Function Component添加Hook的原因，在本篇文章中我将会为大家提供一份较为全面的React Hook实践指南，其中包括以下方面的内容：
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
React Hook是React 16.8版本之后添加的新属性，用最简单的话来说，**React Hook就是一些React提供的内置函数，这些函数可以让Function Component和Class Component一样能够拥有组件状态（state）以及进行副作用（side effect）**。

## 常用Hook介绍
接下来我将会为大家介绍一些常用的Hook，对于每一个Hook，我都会覆盖以下方面的内容：
* 作用
* 用法
* 注意事项

### useState
#### 作用
`useState`理解起来非常简单，和Class Component的`this.state`一样，都是用来**管理组件状态的**。在React Hook没出来之前，Function Component也叫做Functional Stateless Component（FSC），这是因为Function Component每次执行的时候都会生成新的函数作用域所以同一个组件的不同渲染（render）之间是不能够共用状态的，因此开发者一旦需要在组件中引入状态就需要将原来的Function Component改成Class Component，这使得开发者的体验十分不好。`useState`就是用来解决这个问题的，**它允许Function Component将自己的状态持久化到React运行时（runtime）的某个地方（memory cell），这样在组件每次重新渲染的时候都可以从这个地方拿到该状态，而且当该状态被更新的时候，组件也会重渲染**。

#### 用法
```javascript
const [state, setState] = useState(initialState)
```
`useState`接收一个`initialState`变量作为状态的初始值，返回值是一个数组。返回数组的第一个元素代表当前`state`的最新值，第二个元素是一个用来更新`state`的函数。这里要注意的是`state`和`setState`这两个变量的命名不是固定的，应该根据你业务的实际情况选择不同的名字，可以是`text`和`setText`，也可以是`width`和`setWidth`这类的命名。（对上面数组解构赋值不熟悉的同学可以看下[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)的介绍）。

我们在实际开发中，一个组件可能不止一个state，如果组件有多个state，则可以在组件内部多次调用`useState`，以下是一个简单的例子：
```jsx
import React, { useState } from 'react'
import ReactDOM from 'react-dom'

const App = () => {
  const [counter, setCounter] = useState(0)
  const [text, setText] = useState('')

  const handleTextChange = (event) => {
    setText(event.target.value)
  }

  return (
    <>
      <div>Current counter: {counter}</div>
      <button
        onClick={() => setCounter(counter + 1)}
      >
        Increase counter
      </button>
      <input
        onChange={handleTextChange}
        value={text}
      />
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
和Class Component的[this.setState](https://reactjs.org/docs/react-component.html#setstate) API类似，`setCounter`和`setText`都可以接收一个函数为参数，这个函数叫做`updater`，`updater`接收的参数是当前状态的**最新值**，返回值是**下一个状态**。例如setCounter的参数可以改成一个函数：
```javascript
<button
  onClick={() => {
    setCounter(counter => counter + 1)
  }}
>
  Increase counter
</button>
```
`useState`的`initialState`也可以是一个用来生成状态初始值的函数，这种做法主要是避免组件每次渲染的时候`initialState`需要被重复计算。下面是个简单的例子：
```javascript
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props)
  return initialState
})
```

#### 注意事项
##### setState是全量替代
Function Component的`setState`和Class Component的`this.setState`函数的一个重要区别是`this.setState`函数是**将当前设置的state浅归并（shallowly merge）到旧state的操作**。而`setState`函数则是将**新state直接替换旧的state（replace）**。因此我们在编写Function Component的时候，就要合理划分state，避免将没有关系的状态放在一起管理，例如下面这个是不好的设计：
```jsx
const [state, setState] = useState({ left: 0, top: 0, width: 0, height: 0 })
```
在上面代码中，由于我们将互不关联的DOM位置信息`{left: 0, top: 0}`和大小信息`{width: 0, height: 0}`绑定在同一个`state`，所以我们在更新任意一个状态的时候也要维护一下另外一个状态：
```jsx
const handleContainerResize = ({ width, height }) => {
  setState({...state, width, height})
}

const handleContainerMove = ({ left, top }) => {
  setState({...state, left, top})
}
```
这种写法十分不方便而且容易引发bug，更加合理的做法应该是将位置信息和大小信息**放在两个不同的state里面**，这样可以避免更新某个状态的时候要手动维护另一个状态：
```javascript
// separate state into position and size states
const [position, setPosition] = useState({ left: 0, top: 0 })
const [size, setSize] = useState({ width: 0, height: 0})

const handleContainerResize = ({ width, height }) => {
  setSize({width, height})
}

const handleContainerMove = ({ left, top }) => {
  setPosition({left, top})
}
```
如果你确实要将多个互不关联的状态放在一起的话，建议你使用[useReducer](#usereducer)来管理你的状态，这样你的代码会更好维护。

##### 设置相同的state值时setState会[bailing out of update](https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update)
如果setState接收到的`新的state`和`当前的state`是一样的（判断方法是[Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Description)），React将不会重新渲染子组件或者触发`side effect`。这里要注意的是虽然React不会渲染子组件，不过它还是会重新渲染当前的组件的，如果你的组件渲染有些很耗性能的计算的话，可以考虑使用[useMemo](#usememo)来优化性能。

##### setState没有回调函数
无论是`useState`还是Class Component的`this.setState`都是**异步调用**的，也就是说每次组件调用完它们之后都不能拿到最新的state值。为了解决这个问题，Class Component的`this.setState`允许你通过一个回调函数来获取到最新的state值，用法如下：
```jsx
this.setState(newState, state => {
  console.log("I get new state", state)
})
```
而Function Component的setState函数不存在这么一个可以拿到最新state的回调函数，不过我们可以使用[useEffect](#useeffect)来实现相同的效果，具体可以参见StackOverflow的这个[讨论](https://stackoverflow.com/questions/54954091/how-to-use-callback-with-usestate-hook-in-react)。

### useEffect
#### 作用
`useEffect`是用来使Function Component也可以进行副作用的。那么什么是副作用呢？我们可以先来看看维基百科的定义：
> In computer science, an operation, function or expression is said to have a side effect if it modifies some state variable value(s) outside its local environment, that is to say has an observable effect besides returning a value (the main effect) to the invoker of the operation.

通俗来说，**函数的副作用就是函数除了返回值外对外界环境造成的其它影响**。举个例子，假如我们每次执行一个函数，该函数都会操作全局的一个变量，那么对全局变量的操作就是这个函数的副作用。而在React的世界里，我们的副作用大体可以分为两类，一类是**调用浏览器的API**，例如使用`addEventListener`来添加事件监听函数等，另外一类是**发起获取服务器数据的请求**，例如当用户卡片挂载的时候去异步获取用户的信息等。在Hook出来之前，如果我们需要在组件中进行副作用的话就需要将组件写成Class Component，然后在组件的生命周期函数里面写副作用，这其实会引起很多代码设计上的问题，具体大家可以查看我的上篇文章[React为什么需要Hook](https://superseany.com/2020/04/29/React%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81Hook/)。Hook出来之后，开发者就可以在Function Component中使用`useEffect`来定义副作用了。虽然`useEffect`基本可以覆盖`componentDidMount`， `componentDidUpdate`，`componentWillUnmount`等生命周期函数组合起来使用的所有场景，但是`useEffect`和生命周期函数的设计理念还是存在本质上的区别的，如果一味用生命周期函数的思考方式去理解和使用`useEffect`的话，可能会引发一些奇怪的问题，大家有兴趣的话，可以看看React核心开发Dan写的这篇文章：[A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)，里面阐述了使用`useEffect`的一个比较正确的思考方式（mental model）。

#### 用法
```javascript
useEffect(effect, dependencies?)
```
useEffect的第一个参数effect是要执行的副作用函数，它可以是任意的用户自定义函数，用户可以在这个函数里面操作一些浏览器的API或者和外部环境进行交互，这个函数会在**每次组件渲染完成之后**被调用，例如下面是一个简单的例子：
```javascript
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

const UserDetail = ({ userId }) => {
  const [userDetail, setUserDetail] = useState({})

  useEffect(() => {
    fetch(`https://myapi/users/${userId}`)
      .then(response => response.json())
      .then(user => setUserDetail(userDetail))
  })

  return (
    <div>
      <div>User Name: {userDetail.name}</div>
    </div>
  )
}

ReactDOM.render(<UserDetail />, document.getElementById('root'))
```
上面定义的获取用户详情信息的副作用会在`UserDetail组件`每次**完成渲染后**执行，所以当该组件第一次挂载的时候就会向服务器发起获取用户详情信息的请求然后更新`userDetail`的值，这里的第一次挂载我们可以类比成Class Component的`componentDidMount`。可是如果试着运行一下上面的代码的话，你会发现代码进入了死循环：组件会不断向服务端发起请求。出现这个死循环的原因是`useEffect`里面调用了`setUserDetail`，这个函数会更新`userDetail`的值，从而使组件重渲染，而重渲染后`useEffect`的`effect`继续被执行，进而组件再次重渲染。。。为了避免重复的副作用执行，`useEffect`允许我们通过第二个参数`dependencies`来限制该副作用什么时候被执行：指明了`dependencies`的副作用，**只有在`dependencies`数组里面的元素的值发生变化时才会被执行**，因此如果要避免上面的代码进入死循环我们就要将`userId`指定为我们定义的副作用的`dependencies`：
```javascript
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

const UserDetail = ({ userId }) => {
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

ReactDOM.render(<UserDetail />, document.getElementById('root'))
```
除了发起服务端的请求外，我们往往还需要在`useEffect`里面调用浏览器的API，例如使用`addEventListener`来添加浏览器事件的监听函数等。我们一旦使用了`addEventListener`就必须在合适的时候调用`removeEventListener`来移除对事件的监听，否则会有性能问题，`useEffect`允许我们在副作用函数里面返回一个`cleanup`函数，这个函数会在组件**重新渲染之前**被执行，我们可以在这个返回的函数里面移除对事件的监听，下面是一个具体的例子：
```javascript
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

const WindowScrollListener = () => {
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
      I can listen to the window scroll event!
    </div>
  )
}

ReactDOM.render(<WindowScrollListener />, document.getElementById('root'))
```
上面的代码中我们会在`WindowScrollListener`组件首次渲染完成后注册一个监听页面滚动事件的函数，并在组件下一次渲染前移除该监听函数。由于我们指定了一个空数组作为这个副作用的`dependencies`，所以这个副作用只会在组件首次渲染时被执行一次，而它的cleanup函数只会在组件`unmount`时才被执行，这就避免了频繁注册页面监听函数从而影响页面的性能。

#### 注意事项
##### 避免使用“旧的”变量
我们在实际使用`useEffect`的过程中可能遇到最多的问题就是我们的effect函数被调用的时候，拿到的某些state, props或者是变量不是**最新**的变量而是之前**旧的**变量。出现这个问题的原因是：我们定义的副作用其实就是一个函数，而JS的作用域是词法作用域，所以函数使用到的变量值是它被**定义时**就确定的，用最简单的话来说就是，useEffect的effect会**记住**它被定义时的外部变量的值，所以它被调用时使用到的值可能不是**最新**的值。解决这个问题的办法有两种，一种是将那些你希望每次effect被调用时拿到的都是最新值的变量保存在一个ref里面，并且在每次组件渲染的时候更新该ref的值：
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
这种做法虽然不是很优雅，不过可以解决我们的问题，如果你没有了解过`useRef`用法的话，可以查看本篇文章[useRef](#useref)这部分内容。解决这个问题的另外一个做法是将副作用**使用**到的所有变量都加到effect的`dependencies`中去，这也是比较推荐的做法。在实际开发中我们可以使用facebook自家的[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks#installation)的[exhaustive-deps](https://github.com/facebook/react/issues/14920)规则来进行编码约束，在你的项目加上这个约束之后，在代码开发阶段eslint就会告诉你要将someState放到`useEffect`的`dependencies`中去，这样就可以不使用`useRef`来存储someState的值了，例如下面代码：
```javascript
const [someState, setSomeState] = useState()

useEffect(() => {
  ...
  console.log(someState)
}, [otherDependencies..., someState])
```
### useRef
#### 作用
`useRef`是用来在组件不同渲染之间共用一些数据的，它的作用和我们在Class Component里面为`this`赋值是一样的。
#### 用法
```javascript
const refObject = useRef(initialValue)
```
`useRef`接收`initialValue`作为初始值，它的返回值是一个`ref`对象，这个对象的`.current`属性就是该数据的最新值。使用`useRef`的一个最简单的情况就是在Function Component里面存储对DOM对象的引用，例如下面这个例子：
```javascript
import { useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

const AutoFocusInput = () => {
  const inputRef = useRef(null)

  useEffect(() => {
    // auto focus when component mount
    inputRef.current.focus()
  }, [])

  return (
    <input ref={inputRef} type='text' />
  )
}

ReactDOM.render(<AutoFocusInput />, document.getElementById('root'))
```
在上面代码中inputRef其实就是一个`{current: inputDomInstance}`对象，只不过它可以保证在组件每次渲染的时候拿到的都是同一个对象。
#### 注意事项
##### 更新ref对象不会触发组件重渲染
`useRef`返回的ref object被重新赋值的时候不会引起组件的**重渲染**，如果你有这个需求的话请使用`useState`来存储数据。
### useCallback
#### 作用
随着Hook的出现，开发者开始越来越多地使用Function Component来开发需求。当开发者在定义Function Component的时候往往需要在函数体内定义一些内嵌函数（inline function），这些内嵌函数会在组件每次重新渲染的时候被重新定义，如果它们作为props传递给了子组件的话，即使其它props的值没有发生变化，它都会使子组件重新渲染，而无用的组件重渲染可能会产生一些性能问题。每次重新生成新的内嵌函数还有另外一个问题就是当我们把内嵌函数作为`dependency`传进`useEffect`的`dependencies`数组的话，因为该函数频繁被重新生成，所以`useEffect`里面的effect就会频繁被调用。为了解决上述问题，React允许我们使用`useCallback`来**记住**（memoize）当前定义的函数，并在下次组件渲染的时候返回之前定义的函数而不是使用新定义的函数。
#### 用法
```javascript
const memoizedCallback = useCallback(callback, dependencies)
```
`useCallback`接收两个参数，第一个参数是需要被记住的函数，第二个参数是这个函数的`dependencies`，只有`dependencies`数组里面的元素的值发生变化时`useCallback`才会返回新定义的函数，否则`useCallback`都会返回之前定义的函数。下面是一个简单的使用`useCallback`来优化子组件频繁被渲染的例子：
```javascript
import React, { useCallback } from 'react'
import useSearch from 'hooks/useSearch'
import ReactDOM from 'react-dom'

// this list may contain thousands of items, so each re-render is expensive
const HugeList = ({ items, onClick }) => {
  return (
    <div>
      {
        items.map((item, index) => (
          <div
            key={index}
            onClick={() => onClick(index)}
          >
            {item}
          </div>
        ))
      }
    </div>
  )
}

const MemoizedHugeList = React.memo(HugeList)

const SearchApp = ({ searchText }) => {
  const handleClick = useCallback(item => {
    console.log('You clicked', item)
  }, [])
  const items = useSearch(searchText)

  return (
    <MemoizedHugeList
      items={items}
      onClick={handleClick}
    />
  )
}

ReactDOM.render(<SearchApp />, document.getElementById('root'))
```
上面的例子中我定义了一个`HugeList`组件，由于这个组件需要渲染一个大的列表（items），所以每次重渲染都是十分消耗性能的，因此我使用了`React.memo`函数来让该组件只有在`onClick`函数和`items`数组发生变化的时候才被渲染，如果大家对`React.memo`不是很熟悉的话，可以看看我写的[这篇文章](https://juejin.im/post/5c8edf626fb9a0710d65c7fc)。接着我在`SearchApp`里面使用`MemoizedHugeList`，由于要避免该组件的重复渲染，所以我使用了`useCallback`来记住定义的`handleClick函数`，这样在组件后面渲染的时候，`handleClick`变量指向的都是同一个函数，所以`MemorizedHugeList`只有在items发生变化时才会重新渲染。这里要注意的是由于我的`handleClick`函数没有使用到任何的外部依赖所以它的`dependencies`才是个空数组，如果你的函数有使用到外面的依赖的话，记得一定要将该依赖放进`useCallback`的`dependencies`参数中，不然会有bug发生。

#### 注意事项
##### 避免在函数里面使用“旧的”变量
和`useEffect`类似，我们也需要将所有在`useCallback`的callback中使用到的外部变量写到`dependencies`数组里面，不然我们可能会在`callback`调用的时候使用到“旧的”外部变量的值。

##### 不是所有函数都要使用useCallback
> Performance optimizations are not free. They ALWAYS come with a cost but do NOT always come with a benefit to offset that cost.

**任何优化都会有代价**，`useCallback`也是一样的。当我们在Function Component里面调用`useCallback`函数的时候，React背后要做一系列计算才能保证当`dependencies`不发生变化的时候，我们拿到的是同一个函数，因此如果我们滥用`useCallback`的话，并不会带来想象中的性能优化，反而会影响到我们的性能，例如下面这个例子就是一个不好的使用`useCallback`的例子：
```javascript
import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'

const DummyButton = () => {
  const handleClick = useCallback(() => {
    console.log('button is clicked')
  }, [])

  return (
    <button onClick={handleClick}>
      I'm super dummy
    </button>
  )
}

ReactDOM.render(<DummyButton />, document.getElementById('root'))
```
上面例子使用的`useCallback`没有起到任何优化代码性能的作用，因为上面的代码执行起来其实相当于下面的代码：
```javascript
import React, { useCallback } from 'react'
import ReactDOM from 'react-dom'

const DummyButton = () => {
  const inlineClick = () => {
    console.log('button is clicked')
  }
  const handleClick = useCallback(inlineClick, [])

  return (
    <button onClick={handleClick}>
      I'm super dummy
    </button>
  )
}

ReactDOM.render(<DummyButton />, document.getElementById('root'))
```
从上面的代码我们可以看出，即使我们使用了`useCallback`函数，浏览器在执行`DummyButton`这个函数的时候还是需要创建一个新的内嵌函数`inlineClick`，这和不使用`useCallback`的效果是一样的，而且除此之外，优化后的代码由于还调用了`useCallback`函数，所以它消耗的计算资源其实比没有优化之前还多，而且由于`useCallback`函数内部存储了一些额外的变量（例如之前的`dependencies`）所以它消耗的内存资源也会更多。因此我们并不能一味地将所有的内嵌函数使用`useCallback`来包裹，只对那些真正需要被记住的函数使用`useCallback`。

### useMemo
#### 作用
`useMemo`和`useCallback`的作用十分类似，只不过它允许你`记住`任何类型的变量（不只是函数）。
#### 用法
```javascript
const memoizedValue = useMemo(() => valueNeededToBeMemoized, dependencies)
```
`useMemo`接收一个函数，该函数的返回值就是需要被记住的变量，当`useMemo`的第二个参数`dependencies`数组里面的元素的值没有发生变化的时候，`memoizedValue`使用的就是上一次的值。下面是一个例子：
```javascript
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'

const RenderPrimes = ({ iterations, multiplier }) => {
  const primes = React.useMemo(() => calculatePrimes(iterations, multiplier), [
    iterations,
    multiplier
  ])

  return (
    <div>
      Primes! {primes}
    </div>
  )
}

ReactDOM.render(<RenderPrimes />, document.getElementById('root'))
```
上面的例子中[calculatePrimes](https://developer.mozilla.org/en-US/docs/Tools/Performance/Scenarios/Intensive_JavaScript)是用来计算素数的，因此每次调用它都需要消耗大量的计算资源。为了提高组件渲染的性能，我们可以使用`useMemo`来记住计算的结果，当`iterations`和`multiplier`保持不变的时候，我们就不需要重新执行calculatePrimes函数来重新计算了，直接使用上一次的结果即可。

#### 注意事项
##### 不是所有的变量要包裹在useMemo里面
和`useCallback`类似，我们只将那些确实有需要被记住的变量使用`useMemo`来封装，切记不能滥用`useMemo`，例如下面就是一个滥用`useMemo`的例子：
```javascript
import React, { useMemo } from 'react'
import ReactDOM from 'react-dom'

const DummyDisplay = () => {
  const items = useMemo(() => ['1', '2', '3'], [])
  
  return (
    <>
      {
        items.map(item => <div key={item}>{item}</div>)
      }
    </>
  )
}

ReactDOM.render(<DummyDisplay />, document.getElementById('root'))
```
上面的例子中直接将items定义在组件外面会更好：
```javascript
import React from 'react'
import ReactDOM from 'react-dom'

const items = ['1', '2', '3']

const DummyDisplay = () => {  
  return (
    <>
      {
        items.map(item => <div key={item}>{item}</div>)
      }
    </>
  )
}

ReactDOM.render(<DummyDisplay />, document.getElementById('root'))
```

### useContext
#### 作用
我们知道React中组件之间传递参数的方式是props，假如我们在父级组件中定义了某些状态，而这些状态需要在该组件深层次嵌套的子组件中被使用的话就需要将这些状态以props的形式层层传递，这就造成了`props drilling`的问题。为了解决这个问题，React允许我们使用`Context`来在父级组件和底下任意层次的子组件之间传递状态。在Function Component中我们可以使用`useContext` Hook来使用`context`。
#### 用法
```javascript
const value = useContext(MyContext)
```
`useContext`接收一个`context`对象为参数，该`context`对象是由`React.createContext`函数生成的。`useContext`的返回值是当前`context`的值，这个值是由最邻近的`<MyContext.Provider>`来决定的。一旦在某个组件里面使用了`useContext`这就相当于该组件订阅了这个`context`的变化，当最近的`<MyContext.Provider>`的`context`值发生变化时，使用到该`context`的子组件就会被触发重渲染，且它们会拿到`context`的最新值。下面是一个具体的例子：
```javascript
import React, { useContext, useState } from 'react'
import ReactDOM from 'react-dom'

// define context
const NumberContext = React.createContext()

const NumberDisplay = () => {
  const [currentNumber, setCurrentNumber] = useContext(NumberContext)

  const handleCurrentNumberChange = () => {
    setCurrentNumber(Math.floor(Math.random() * 100))
  }

  return (
    <>
      <div>Current number is: {currentNumber}</div>
      <button onClick={handleCurrentNumberChange}>Change current number</button>
    </>
  )
}

const ParentComponent = () => {
  const [currentNumber, setCurrentNumber] = useState({})

  return (
    <NumberContext.Provider value={[currentNumber, setCurrentNumber]}>
      <NumberDisplay />
    </NumberContext.Provider>
  )
}

ReactDOM.render(<ParentComponent />, document.getElementById('root'))
```
#### 注意事项
##### 避免无用渲染
我们在上面已经提到如果一个Function Component使用了`useContext(SomeContext)`的话它就订阅了这个`SomeContext`的变化，这样当`SomeContext.Provider`的`value`发生变化的时候，这个组件就会被重新渲染。这里有一个问题就是，我们可能会把很多不同的数据放在同一个`context`里面，而不同的子组件可能只关心这个`context`的某一部分数据，当`context`里面的任意值发生变化的时候，无论这些组件用不用到这些数据它们都会被重新渲染，这可能会造成一些性能问题。下面是一个简单的例子：
```javascript
import React, { useContext, useState } from 'react'
import ExpensiveTree from 'somewhere/ExpensiveTree'
import ReactDOM from 'react-dom'

const AppContext = React.createContext()

const ChildrenComponent = () => {
  const [appContext] = useContext(AppContext)
  const theme = appContext.theme

  return (
    <div>
      <ExpensiveTree theme={theme} />
    </div>
  )
}

const App = () => {
  const [appContext, setAppContext] = useState({ theme: { color: 'red' }, configuration: { showTips: false }})

  return (
    <AppContext.Provider value={[appContext, setAppContext]}>
      <ChildrenComponent />
    </AppContext.Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
在上面的例子中，ChildrenComponent只使用到了appContext的`.theme`属性，可是当appContext其它属性例如configuration被更新时，ChildrenComponent也会被重新渲染，而ChildrenComponent调用了一个十分耗费性能的ExpensiveTree组件，所以这些无用的渲染会影响到我们页面的性能，解决上面这个问题的方法有下面三种：
###### 拆分Context
这个方法是最被推荐的做法，和`useState`一样，我们可以将不需要同时改变的`context`拆分成不同的`context`，让它们的职责更加分明，这样子组件只会订阅那些它们需要订阅的`context`从而避免无用的重渲染。例如上面的代码可以改成这样：
```javascript
import React, { useContext, useState } from 'react'
import ExpensiveTree from 'somewhere/ExpensiveTree'
import ReactDOM from 'react-dom'

const ThemeContext = React.createContext()
const ConfigurationContext = React.createContext()

const ChildrenComponent = () => {
  const [themeContext] = useContext(ThemeContext)

  return (
    <div>
      <ExpensiveTree theme={themeContext} />
    </div>
  )
}

const App = () => {
  const [themeContext, setThemeContext] = useState({ color: 'red' })
  const [configurationContext, setConfigurationContext] = useState({ showTips: false })

  return (
    <ThemeContext.Provider value={[themeContext, setThemeContext]}>
      <ConfigurationContext.Provider value={[configurationContext, setConfigurationContext]}>
        <ChildrenComponent />
      </ConfigurationContext.Provider>
    </ThemeContext.Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
###### 拆分你的组件，使用memo来优化消耗性能的组件
如果出于某些原因你不能拆分`context`，你仍然可以通过将消耗性能的组件和父组件的其他部分分离开来，并且使用`memo`函数来优化消耗性能的组件。例如上面的代码可以改为：
```javascript
import React, { useContext, useState } from 'react'
import ExpensiveTree from 'somewhere/ExpensiveTree'
import ReactDOM from 'react-dom'

const AppContext = React.createContext()

const ExpensiveComponentWrapper = React.memo(({ theme }) => {
  return (
    <ExpensiveTree theme={theme} />
  )
})

const ChildrenComponent = () => {
  const [appContext] = useContext(AppContext)
  const theme = appContext.theme

  return (
    <div>
      <ExpensiveComponentWrapper theme={theme} />
    </div>
  )
}

const App = () => {
  const [appContext, setAppContext] = useState({ theme: { color: 'red' }, configuration: { showTips: false }})

  return (
    <AppContext.Provider value={[appContext, setAppContext]}>
      <ChildrenComponent />
    </AppContext.Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
###### 不拆分组件，也可以使用useMemo来优化
当然我们也可以不拆分组件使用`useMemo`来将上面的代码进行优化，代码如下：
```javascript
import React, { useContext, useState, useMemo } from 'react'
import ExpensiveTree from 'somewhere/ExpensiveTree'
import ReactDOM from 'react-dom'

const AppContext = React.createContext()

const ChildrenComponent = () => {
  const [appContext] = useContext(AppContext)
  const theme = appContext.theme

  return useMemo(() => (
      <div>
        <ExpensiveTree theme={theme} />
      </div>
    ),
    [theme]
  )
}

const App = () => {
  const [appContext, setAppContext] = useState({ theme: { color: 'red' }, configuration: { showTips: false }})

  return (
    <AppContext.Provider value={[appContext, setAppContext]}>
      <ChildrenComponent />
    </AppContext.Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
### useReducer
#### 作用
`useReducer`用最简单的话来说就是允许我们在Function Component里面像使用[redux](https://redux.js.org/)一样通过`reducer`和`action`来管理我们组件状态的变换（state transition）。
#### 用法
```javascript
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```
`useReducer`和`useState`类似，都是用来管理组件状态的，只不过和`useState`的`setState`不一样的是，`useReducer`返回的`dispatch`函数是用来触发某些改变`state`的`action`而不是直接设置`state`的值，至于不同的`action`如何产生新的state的值则在`reducer`里面定义。`useReducer`接收的三个参数分别是：
* reducer: 这是一个函数，它的签名是`(currentState, action) => newState`，从它的函数签名可以看出它会接收当前的state和当前`dispatch`的`action`为参数，然后返回下一个state,也就是说它负责状态转换（state transition）的工作。
* initialArg：如果调用者没有提供第三个`init`参数，这个参数代表的是这个`reducer`的初始状态，如果`init`参数有被指定的话，`initialArg`会被作为参数传进`init`函数来生成初始状态。
* init: 这是一个用来生成初始状态的函数，它的函数签名是`(initialArg) => initialState`，从它的函数签名可以看出它会接收`useReducer`的第二个参数`initialArg`作为参数，并生成一个初始状态`initialState`。
下面是`useReducer`的一个简单的例子：
```javascript
import React, { useState, useReducer } from 'react'

let todoId = 1

const reducer = (currentState, action) => {
  switch(action.type) {
    case 'add':
      return [...currentState, {id: todoId++, text: action.text}]
    case 'delete':
      return currentState.filter(({ id }) => action.id !== id)
    default:
      throw new Error('Unsupported action type')
  }
}

const Todo = ({ id, text, onDelete }) => {
  return (
    <div>
      {text}
      <button
        onClick={() => onDelete(id)}
      >
        remove
      </button>
    </div>
  )
}

const App = () => {
  const [todos, dispatch] = useReducer(reducer, [])
  const [text, setText] = useState('')

  return (
    <>
      {
        todos.map(({ id, text }) => {
          return (
            <Todo
              text={text}
              key={id}
              id={id}
              onDelete={id => {
                dispatch({ type: 'delete', id })
              }}
            />
          )
        })
      }
      <input onChange={event => setText(event.target.value)} />
      <button
        onClick={() => {
          dispatch({ type: 'add', text })
          setText('')
        }}
      >
        add todo
      </button>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
#### 注意事项
##### useReducer vs useState
`useReducer`和`useState`都可以用来管理组件的状态，它们之间最大的区别就是，`useReducer`将状态和状态的变化统一管理在`reducer`函数里面，这样对于一些复杂的状态管理会十分方便我们debug，因为它对状态的改变是`封闭的`。而由于`useState`返回的`setState`可以直接在任意地方设置我们状态的值，当我们组件的状态转换逻辑十分复杂时，它将很难debug，因为它是`开放的`状态管理。总体的来说，在`useReducer`和`useState`如何进行选择的问题上我们可以参考以下这些原则：
* 下列情况使用`useState`
  * `state`的值是JS原始数据类型（primitives），如`number`, `string`和`boolean`等
  * `state`的转换逻辑十分简单
  * 组件内不同的状态是没有关联的，它们可以使用多个独立的`useState`来单独管理
* 下列情况使用`useReducer`
  * `state`的值是`object`或者`array`
  * `state`的转换逻辑十分复杂, 需要使用`reducer`函数来统一管理
  * 组件内多个`state`互相关联，改变一个状态时也需要改变另外一个，将他们放在同一个`state`内使用reducer来统一管理
  * 状态定义在父级组件，不过需要在深层次嵌套的子组件中使用和改变父组件的状态，可以同时使用`useReducer`和`useContext`两个hook，将`dispatch`方法放进context里面来避免组件的`props drilling`
  * 如果你希望你的状态管理是可预测的（predictable）和可维护的（maintainable），请`useReducer`
  * 如果你希望你的状态变化可以被测试，请使用`useReducer`
## 自定义Hook
上面介绍了React内置的常用Hook的用法，接着我们看一下如何编写我们自己的Hook。
### 作用
自定义Hook的目的是让我们封装一些可以在不同组件之间**共用的非UI逻辑**来提高我们开发业务代码的效率。
### 什么是自定义Hook
之前我们说过Hook其实就是一个函数，所以自定义Hook也是一个函数，只不过`它在内部使用了React的内置Hook或者其它的自定义Hook`。虽然我们可以任意命名我们的自定义Hook，可是为了另其它开发者更容易理解我们的代码以及方便一些开发工具例如`eslint-plugin-react-hooks`来给我们更好地提示，我们需要将我们的Hook以`use`作为开头，并且使用驼峰发进行命名，例如`useLocation`，`useLocalStorage`和`useQueryString`等等。
### 例子
下面举一个最简单的自定义hook的例子：
```javascript
import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'

const useCounter = () => {
  const [counter, setCounter] = useState(0)
  
  const increase = useCallback(() => setCounter(counter => ++counter), [])
  const decrease = useCallback(() => setCounter(counter => --counter), [])

  return {
    counter,
    increase,
    decrease
  }
}

const App = () => {
  const { counter, increase, decrease } = useCounter()

  return (
    <>
      <div>Counter: {counter}</div>
      <button onClick={increase}>increase</button>
      <button onClick={decrease}>decrease</button>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```
## 总结
在本篇文章中我给大家介绍了React一些常用的内置Hook以及如何定义我们自己的Hook。React Hook总的来说是一个十分强大的功能，合理地使用它可以提高我们代码的复用率和业务代码的开发效率，不过它也有很多隐藏的各式各样的坑，大家在使用中一定要多加防范，我的个人建议是大家尽量使用`eslint-plugin-react-hooks`插件来辅助开发，因为它真的可以在我们开发的过程中就帮我们发现代码存在的问题，不过有时候想方设法来去掉它的警告确实是很烦人的：）。

在这个系列的下一篇文章中我将教大家如何测试我们自定义的Hook来提高我们的代码质量，大家敬请期待。
## 参考文献
* [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
* [Preventing rerenders with React.memo and useContext hook](https://github.com/facebook/react/issues/15156)
* [React Hook Reference](https://reactjs.org/docs/hooks-reference.html#usereducer)
* [useReducer vs useState in React](https://www.robinwieruch.de/react-usereducer-vs-usestate)


## 个人技术动态
文章始发于我的[个人博客](https://superseany.com/2020/07/15/React-Hook%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)

欢迎关注公众号**进击的大葱**一起学习成长

![](https://user-gold-cdn.xitu.io/2020/7/15/17352093677fa593?w=258&h=258&f=webp&s=4242)