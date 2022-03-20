---
title: 实现JavaScript语言解释器-三
tags:
  - TypeScript
  - Interpreter
  - JavaScript
  - 编译原理
thumbnail: /gallery/thumbnails/simple-js.jpg
date: 2022-03-07 21:11:16
---


## 前言
[上篇文章](https://superseany.com/2021/04/18/%E5%AE%9E%E7%8E%B0JavaScript%E8%AF%AD%E8%A8%80%E8%A7%A3%E9%87%8A%E5%99%A8-%E4%BA%8C/)我为大家介绍了`语法解析`的一些基本概念，以及如何通过自定义的DSL语言实现Simple语言解释器的语法树解析。在本篇也是这个系列最后一篇文章中我将为大家介绍Simple解释器是如何执行生成的语法树的。

## evaluate函数和作用域
前面在介绍语法解析相关知识的时候有出现过`evaluate`函数，其实`基本每一个AST节点都会有一个对应的evaluate函数`，这个函数的作用就是告诉Simple解释器如何执行当前AST节点。因此Simple解释器执行代码的过程就是：`从根节点开始执行当前节点的evaluate函数然后递归地执行子节点evalute函数的过程`。

<!-- more-->

我们知道JavaScript代码执行的时候有一个概念叫做`作用域`，当我们访问一个变量的时候，会先看看当前作用域有没有定义这个变量，如果没有就会沿着作用域链向上一直寻找到全局作用域，如果作用域链上都没有该变量的定义的话就会抛出一个`Uncaught ReferenceError: xx is not defined`的错误。在实现Simple语言解释器的时候，我参照了JavaScript作用域的概念实现了一个叫做`Environment`的类，我们来看看Evironment类的实现：
```ts
// lib/runtime/Environment.ts

// Environment类就是Simple语言的作用域
class Environment {
  // parent指向当前作用域的父级作用域
  private parent: Environment = null
  // values对象会以key-value的形式存储当前作用域变量的引用和值
  // 例如values = {a: 10}，代表当前作用域有一个变量a，它的值是10
  protected values: Object = {}

  // 当前作用域有新的变量定义的时候会调用create函数进行值的设置
  // 例如执行 let a = 10 时，会调用env.create('a', 10)
  create(key: string, value: any) {
    if(this.values.hasOwnProperty(key)) {
      throw new Error(`${key} has been initialized`)
    }
    this.values[key] = value
  }

  // 如果某个变量被重新赋值，Simple会沿着当前作用域链进行寻找，找到最近的符合条件的作用域，然后在该作用域上进行重新赋值
  update(key: string, value: any) {
    const matchedEnvironment = this.getEnvironmentWithKey(key)
    if (!matchedEnvironment) {
      throw new Error(`Uncaught ReferenceError: ${key} hasn't been defined`)
    }
    matchedEnvironment.values = {
      ...matchedEnvironment.values,
      [key]: value
    }
  }

  // 在作用域链上寻找某个变量，如果没有找到就抛出Uncaught ReferenceError的错误
  get(key: string) {
    const matchedEnvironment = this.getEnvironmentWithKey(key)
    if (!matchedEnvironment) {
      throw new Error(`Uncaught ReferenceError: ${key} is not defined`)
    }

    return matchedEnvironment.values[key]
  }

  // 沿着作用域链向上寻找某个变量的值，如果没有找到就返回null
  private getEnvironmentWithKey(key: string): Environment {
    if(this.values.hasOwnProperty(key)) {
      return this
    }
  
    let currentEnvironment = this.parent
    while(currentEnvironment) {
      if (currentEnvironment.values.hasOwnProperty(key)) {
        return currentEnvironment
      }
      currentEnvironment = currentEnvironment.parent
    }

    return null
  }
}
```
从上面的代码以及注释可以看出，所谓的作用域链其实就是由Environment实例组成的`单向链表`。解析某个变量值的时候会沿着这个作用域链进行寻找，如果没有找到该变量的定义就会报错。接着我们以for循环执行的过程来看一下具体过程是怎么样的：

被执行的代码：
```ts
for(let i = 0; i < 10; i++) {
  console.log(i);
};
```
ForStatement代码的执行过程：
```ts
// lib/ast/node/ForStatement.ts
class ForStatement extends Node {
  ...

  // evaluate函数会接受一个作用域对象，这个对象代表当前AST节点的执行作用域
  evaluate(env: Environment): any {
    // 上面for循环括号里面的内容是在一个独立的作用域里面的，所以需要基于父级节点传递过来的作用域新建一个作用域，取名为bridgeEnvironment
    const bridgeEnvironment = new Environment(env)
    // if括号内的变量初始化(let i = 0)会在这个作用域里面进行
    this.init.evaluate(bridgeEnvironment)

    // 如果当前作用域没有被break语句退出 && return语句返回 && 测试表达式(i < 10)是真值，for循环就会继续执行，否则for循环中断
    while(!runtime.isBreak && !runtime.isReturn && this.test.evaluate(bridgeEnvironment)) {
      // 因为for循环体(console.log(i))是一个新的作用域，所以要基于当前的brigeEnvironment新建一个子作用域
      const executionEnvironment = new Environment(bridgeEnvironment)
      this.body.evaluate(executionEnvironment)
      // 循环变量的更新(i++)会在brigeEnvironment里面执行
      this.update.evaluate(bridgeEnvironment)
    }
  }
}
```

## 闭包和this绑定
在理解了evalute函数的一般执行过程后，我们再来看看`闭包`是如何实现的。我们都知道JavaScript是`词法作用域`，也就是说一个`函数的作用域链在这个函数被定义的时候就决定了`。我们通过函数声明节点`FunctionDeclaration`的evaluate函数的代码来看一下Simple语言的闭包是如何实现的:
```ts
// lib/ast/node/FunctionDeclaration.ts
class FunctionDeclaration extends Node {
  ...

  // 当函数声明语句被执行的时候，这个evaluate函数会被执行，传进来的对象就是当前的执行作用域
  evaluate(env: Environment): any {
    // 生成一个新的FunctionDeclaration对象，因为同一个函数可能被多次定义（例如这个函数被嵌套定义在某个父级函数的时候）
    const func = new FunctionDeclaration()
    // 函数复制
    func.loc = this.loc
    func.id = this.id
    func.params = [...this.params]
    func.body = this.body
    
    // 函数被声明的时候会通过parentEnv属性记录下当前的执行作用域，这就是闭包了！！！
    func.parentEnv = env

    // 将函数注册到当前的执行作用域上面，该函数就可以被递归调用了
    env.create(this.id.name, func)
  }
  ...
}
```
从上面的代码可以看出，要实现Simple语言的闭包，`其实只需要在函数声明的时候记录一下当前作用域(parentEnv)就可以了`。

接着我们再来看一下函数执行的时候是如何判断`this`绑定的是哪个对象的：
```ts
// lib/ast/node/FunctionDeclaration.ts
class FunctionDeclaration extends Node {
  ...

  // 函数执行的时候，如果存在调用函数的实例，该实例会被当做参数传进来，例如a.test()，a就是test的这个参数
  call(args: Array<any>, callerInstance?: any): any {
    // 函数执行时传进来的参数如果少于声明的参数会报错
    if (this.params.length !== args.length) {
      throw new Error('function declared parameters are not matched with arguments')
    }

    // 这是实现闭包的重点，函数执行时的父级作用域是之前函数被定义的时候记录下来的父级作用域！！
    const callEnvironment = new Environment(this.parentEnv)
    
    // 函数参数进行初始化
    for (let i = 0; i < args.length; i++) {
      const argument = args[i]
      const param = this.params[i]

      callEnvironment.create(param.name, argument)
    }
    // 创建函数的arguments对象
    callEnvironment.create('arguments', args)

    // 如果当前函数有调用实例，那么这个函数的this将会是调用实例
    if (callerInstance) {
      callEnvironment.create('this', callerInstance)
    } else {
      // 如果函数没有调用实例，就会沿着函数的作用域链就行寻找，直到全局的process(node)或者window(browser)对象
      callEnvironment.create('this', this.parentEnv.getRootEnv().get('process'))
    }

    // 函数体的执行
    this.body.evaluate(callEnvironment)
  }
}
```
上面的代码大概给大家介绍了Simple语言的this是如何绑定的，实际上JavaScript的实现可能和这个有比较大的出入，这里只是给大家一个参考而已。

## 总结
在本篇文章中我给大家介绍了Simple解释器是如何执行代码的，其中包括闭包和this绑定的内容，由于篇幅限制这里忽略了很多内容，例如for和while循环的break语句是如何退出的，函数的return语句是如何将值传递给父级函数的，大家如果感兴趣可以看一下我的源码：
https://github.com/XiaocongDong/simple。

最后希望大家经过这三篇系列文章的学习可以对编译原理和JavaScript一些比较难懂的语言特性有一定的了解，也希望后面我可以继续给大家带来优质的内容来让我们共同进步。

* [实现JavaScript语言解释器-一](https://superseany.com/2020/10/29/%E5%AE%9E%E7%8E%B0JavaScript%E8%AF%AD%E8%A8%80%E8%A7%A3%E9%87%8A%E5%99%A8-%E4%B8%80/)
* [实现JavaScript语言解释器-二](https://superseany.com/2021/04/18/%E5%AE%9E%E7%8E%B0JavaScript%E8%AF%AD%E8%A8%80%E8%A7%A3%E9%87%8A%E5%99%A8-%E4%BA%8C/)

## 个人技术动态
欢迎关注公众号**进击的大葱**一起学习成长

![](/images/wechat_qr.jpg)
