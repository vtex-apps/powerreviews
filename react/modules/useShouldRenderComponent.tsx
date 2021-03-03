import { useEffect, useState } from 'react'
import usePRScript from './usePRScript'
import { Product } from 'vtex.product-context'

interface UseShouldRenderComponentProps {
  appKey: string
  locale: string
  merchantGroupId: string
  merchantId: string
  appSettings: Settings
  product: Product
}

const useShouldRenderComponent = ({
  appKey,
  locale,
  merchantGroupId,
  merchantId,
  appSettings,
  product,
}: UseShouldRenderComponentProps) => {
  const [shouldRenderComponent, setShouldRenderComponent] = useState(false)

  const scriptLoaded = usePRScript()

  useEffect(() => {
    if (!window.POWERREVIEWS || !scriptLoaded) {
      return
    }

    if (
      appKey &&
      scriptLoaded &&
      locale &&
      merchantGroupId &&
      merchantId &&
      appSettings &&
      product &&
      product[appSettings.uniqueId]
    ) {
      setShouldRenderComponent(true)
    }
  }, [
    scriptLoaded,
    appKey,
    locale,
    merchantGroupId,
    merchantId,
    appSettings,
    product,
  ])

  return shouldRenderComponent
}

export default useShouldRenderComponent
