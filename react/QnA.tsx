import React, { useEffect, useContext } from 'react'
import { ProductContext } from 'vtex.product-context'
import { useRuntime } from 'vtex.render-runtime'
import usePRScript from './modules/usePRScript'
import { useCssHandles } from 'vtex.css-handles'

const CSS_HANDLES = ['powerReviewsQnA'] as const

function QnA({ appSettings }: { appSettings: Settings }) {
  const handles = useCssHandles(CSS_HANDLES)

  const {
    culture: { locale },
  } = useRuntime()
  const { product } = useContext(ProductContext)
  const { appKey, merchantId, merchantGroupId } = appSettings

  const scriptLoaded = usePRScript()

  useEffect(() => {
    if (!window.POWERREVIEWS || scriptLoaded === false) {
      return
    }

    /* eslint-disable @typescript-eslint/camelcase */
    window.POWERREVIEWS.display.render({
      api_key: appKey,
      locale: locale.replace('-', '_'),
      merchant_group_id: merchantGroupId,
      merchant_id: merchantId,
      page_id: product[appSettings.uniqueId],
      components: {
        QuestionDisplay: 'pr-questiondisplay',
      },
    })
  }, [
    appKey,
    scriptLoaded,
    locale,
    merchantGroupId,
    merchantId,
    product,
    appSettings.uniqueId,
  ])

  return <div className={handles.powerReviewsQnA} id="pr-questiondisplay" />
}

export default QnA
