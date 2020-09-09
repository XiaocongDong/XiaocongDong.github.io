import React from 'react'
import AceEditor from 'react-ace'
import simple from 'simple-language'
import testCases from './testCase'

import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/theme-monokai"

export default () => {
  const [code, setCode] = React.useState('')
  const [example, setExample] = React.useState(Object.keys(testCases)[0])
  const [result, setResult] = React.useState('')

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

      setResult(result)
    } catch(e) {
      console.log(e)
      setResult(e.message)
    }
  }

  return (
    <div>
      <select
        onChange={event => {
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
      <div style={{ display: 'flex' }}>
        <AceEditor
          mode='javascript'
          theme='github'
          onChange={setCode}
          value={code}
          width="100%"
        />
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '2em'
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