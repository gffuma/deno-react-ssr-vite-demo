// @deno-types="npm:@types/react"
import { useState } from 'react'

export default function App() {
  const [counter, setCounter] = useState(0)

  return (
    <div>
      <h1>Running Deno On The Edge!</h1>
      <button onClick={() => setCounter(counter + 1)}>
        Counter: {counter}
      </button>
    </div>
  )
}
