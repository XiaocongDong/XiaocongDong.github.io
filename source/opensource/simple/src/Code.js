import React from 'react'
import AceEditor from 'react-ace'
import simple from 'simple-language'
import testCases from './testCase'

import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-monokai"

export default () => {
  const [code, setCode] = React.useState('')
  const [example, setExample] = React.useState(Object.keys(testCases)[0])
  const [result, setResult] = React.useState('')
  const [tokens, setTokens] = React.useState([])
  const [node, setNode] = React.useState({})

  React.useEffect(() => {
    setCode(testCases[example])
    setResult('')
  }, [example])

  const processCode = () => {
    let result = ''

    const global = {
      console: {
        log: (...args) => {
          result += '\n' + args.join('')
        }
      }
    }

    try {
      const output = simple(code, { global })

      const tokenizerTime = output.tokenizerTime
      const astTime = output.astTime
      const runTime = output.runTime

      result += `\n\ntokenizer time: ${tokenizerTime}ms`
      result += `\nast time: ${astTime}ms`
      result += `\nexecution time: ${runTime}ms`

      setTokens(output.tokens)
      setNode(output.node)
      setResult(result)
    } catch(e) {
      console.log(e)
      setResult(e.message)
      setTokens([])
      setNode({})
    }
  }

  return (
    <div>
      <select
        onChange={event => {
          setTokens([])
          setNode({})
          setExample(event.target.value)
        }}
      >
        {
          Object.entries(testCases).map(([name, code]) => <option
            value={name}
          >
            {name}
          </option>)
        }
      </select>
      <div style={{ display: 'flex', height: '650px', padding: '1em' }}>
        <div style={{ width: '30%' }}>
          <h3>Source code</h3>
          <AceEditor
            width='100%'
            height='600px'
            mode='javascript'
            theme='github'
            onChange={setCode}
            value={code}
          />
        </div>
        <div style={{ height: '100%', width: '30%'}}>
          <div style={{ width: '100%', height: '500px'}}>
            <h3>Lexical Analysis</h3>
            <AceEditor
              value={JSON.stringify(tokens, null, 2)}
              readOnly
              mode='json'
              theme='github'
              style={{ width: '100%', height: '600px'}}
            />
          </div>
        </div>
        <div style={{ height: '100%', width: '40%'}}>
          <div style={{ width: '100%', height: '500px'}}>
            <h3>Syntax Analysis</h3>
            <AceEditor
              readOnly
              value={JSON.stringify(node, null, 2)}
              mode='json'
              theme='github'
              style={{ width: '100%', height: '600px'}}
            />
          </div>
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '2em',
        height: '100px'
      }}>
          <button
            style={{ marginRight: '1em' }}
            onClick={() => {
              processCode(code)
            }}
          >
            Execute
          </button>
          <textarea
            style={{height: '10em', flex: 1}}
            readOnly
            value={result}
          />
        </div>
    </div>
  )
}