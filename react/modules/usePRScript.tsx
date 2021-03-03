import { useEffect, useState } from 'react'

export default function usePRScript() {
  const [loaded, setLoad] = useState(false)
  const POWER_REVIEWS_SRC = 'https://ui.powerreviews.com/stable/4.0/ui.js'

  useEffect(() => {
    const scriptExists = document.querySelectorAll(
      `script[src="${POWER_REVIEWS_SRC}"]`
    ).length

    if (scriptExists) {
      setLoad(true)
      return
    }
    if (!loaded) {
      const script = document.createElement('script')
      script.onload = function() {
        setLoad(true)
      }
      script.src = POWER_REVIEWS_SRC
      document.body.appendChild(script)
    }
  }, [loaded])

  return loaded
}
