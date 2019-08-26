import { useState, useEffect } from 'react'

export default function usePRScript() {
  const [loaded, setLoad] = useState(false)

  useEffect(() => {
    if (!loaded) {
      var script = document.createElement('script')
      script.onload = function() {
        setLoad(true)
      }
      script.src = 'https://ui.powerreviews.com/stable/4.0/ui.js'
      document.body.appendChild(script)
    }
  }, [loaded])

  return loaded
}
