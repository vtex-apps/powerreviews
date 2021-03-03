import React, { useEffect } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'
import usePRScript from './modules/usePRScript'

const CSS_HANDLES = ['powerReviewsForm'] as const

const ReviewForm = ({ appSettings }: { appSettings: Settings }) => {
  const handles = useCssHandles(CSS_HANDLES)

  const {
    culture: { locale },
    query,
  } = useRuntime()
  const {
    appKey,
    merchantId,
    merchantGroupId,
    reviewFormStyleSheetSrc = '',
  } = appSettings

  const scriptLoaded = usePRScript()

  useEffect(() => {
    if (!window.POWERREVIEWS || !scriptLoaded) {
      return
    }

    /* eslint-disable @typescript-eslint/camelcase */
    window.POWERREVIEWS.display.render({
      api_key: appKey,
      locale: locale.replace('-', '_'),
      merchant_group_id: merchantGroupId,
      merchant_id: merchantId,
      page_id: query.pr_page_id,
      style_sheet: reviewFormStyleSheetSrc,
      components: {
        Write: 'pr-write',
      },
    })
  }, [
    appKey,
    scriptLoaded,
    locale,
    merchantGroupId,
    merchantId,
    query.pr_page_id,
    reviewFormStyleSheetSrc,
  ])

  return <div className={handles.powerReviewsForm} id="pr-write" />
}

export default ReviewForm
