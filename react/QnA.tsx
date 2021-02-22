import React, { useContext, useEffect, useState } from 'react'
import { ProductContext } from 'vtex.product-context'
import { useRuntime } from 'vtex.render-runtime'
import usePRScript from './modules/usePRScript'
import { useCssHandles } from 'vtex.css-handles'

const CSS_HANDLES = ['powerReviewsQnA'] as const

const QnA = ({ appSettings }: { appSettings: Settings }) => {
  const handles = useCssHandles(CSS_HANDLES)
  const [isComponentLoaded, setComponentLoaded] = useState(false)

  const {
    culture: { locale },
  } = useRuntime()
  const { product } = useContext(ProductContext)
  const {
    appKey,
    merchantId,
    merchantGroupId,
    qnaStyleSheetSrc = '',
  } = appSettings

  const scriptLoaded = usePRScript()

  useEffect(() => {
    if (!window.POWERREVIEWS || !scriptLoaded) {
      return
    }

    if (
      !isComponentLoaded &&
      appKey &&
      scriptLoaded &&
      locale &&
      merchantGroupId &&
      merchantId &&
      appSettings &&
      product &&
      product[appSettings.uniqueId]
    ) {
      /* eslint-disable @typescript-eslint/camelcase */
      window.POWERREVIEWS.display.render({
        api_key: appKey,
        locale: locale.replace('-', '_'),
        merchant_group_id: merchantGroupId,
        merchant_id: merchantId,
        page_id: product[appSettings.uniqueId],
        style_sheet: qnaStyleSheetSrc,
        components: {
          QuestionDisplay: 'pr-questiondisplay',
        },
      })
      setComponentLoaded(true)
    }
  }, [
    appKey,
    scriptLoaded,
    locale,
    merchantGroupId,
    merchantId,
    product,
    appSettings.uniqueId,
    isComponentLoaded,
    appSettings,
  ])

  return <div className={handles.powerReviewsQnA} id="pr-questiondisplay" />
}

export default QnA
