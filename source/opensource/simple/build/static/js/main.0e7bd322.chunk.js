(this.webpackJsonpsimple=this.webpackJsonpsimple||[]).push([[0],{34:function(e,n,t){e.exports=t(90)},39:function(e,n,t){},89:function(e,n,t){},90:function(e,n,t){"use strict";t.r(n);var o=t(2),a=t.n(o),l=t(31),c=t.n(l),r=(t(39),t(9)),i=t(32),s=t.n(i),u=t(33),m=t.n(u),g={"helloworld.simple":"console.log('Hello World');","variable.simple":"let n = 10;\nlet b = true;\nlet s = 'string';\nlet f = function(x, y, z) {return x + y * z;};\nlet a = [1, 2, 3, {name: 'hi'}, 'hi'];\nlet o = {\n  name: 'sean',\n  age: 27\n};\n\nconsole.log(b);\nconsole.log(s);\nconsole.log(f(1,2,3));\nconsole.log(a[1]);\nconsole.log(o.name);\n","Counter(closure).simple":"\nfunction createCounter() {\n  let a = 0;\n  return function() {\n      a = a + 1;\n      return a;\n  };\n};\n\nlet c1 = createCounter();\nlet c2 = createCounter();\nconsole.log(c1());\nconsole.log(c1());\nconsole.log(c2());\nconsole.log(c2());\n"},f=g,h=(t(87),t(88),function(){var e=a.a.useState(""),n=Object(r.a)(e,2),t=n[0],o=n[1],l=a.a.useState(Object.keys(f)[0]),c=Object(r.a)(l,2),i=c[0],u=c[1],g=a.a.useState(""),h=Object(r.a)(g,2),d=h[0],v=h[1];a.a.useEffect((function(){o(f[i]),v("")}),[i]);return a.a.createElement("div",null,a.a.createElement("select",{onChange:function(e){u(e.target.value)}},Object.entries(f).map((function(e){var n=Object(r.a)(e,2),t=n[0];n[1];return a.a.createElement("option",{value:t},t)}))),a.a.createElement("div",{style:{display:"flex"}},a.a.createElement(s.a,{mode:"javascript",theme:"github",onChange:o,value:t,width:"100%"})),a.a.createElement("div",{style:{display:"flex",alignItems:"center",padding:"2em"}},a.a.createElement("button",{style:{marginRight:"1em"},onClick:function(){!function(){var e="",n={console:{log:function(){for(var n=arguments.length,t=new Array(n),o=0;o<n;o++)t[o]=arguments[o];e+="\n"+t.join("")}}};try{var o=m()(t,{global:n}),a=o.tokenizerTime,l=o.astTime,c=o.runTime;e+="\n\ntokenizer time: ".concat(a,"ns"),e+="\nast time: ".concat(l,"ns"),e+="\nexecution time: ".concat(c,"ns"),v(e)}catch(r){console.log(r),v(r.message)}}()}},"Execute"),a.a.createElement("textarea",{style:{height:"10em",flex:1},readOnly:!0,value:d})))});t(89);var d=function(){return a.a.createElement("div",{className:"App"},a.a.createElement("h1",null,"Welcome to Simple Language Online Editor"),a.a.createElement(h,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(a.a.createElement(a.a.StrictMode,null,a.a.createElement(d,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[34,1,2]]]);
//# sourceMappingURL=main.0e7bd322.chunk.js.map