import type { ReactElement } from 'react'

export function App(): ReactElement {
  const title = document.title
  const elements = [...document.querySelectorAll('button')]
  return (
    <h1>
      {title}: {elements.length}
    </h1>
  )
}
