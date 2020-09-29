import React, { useEffect, useContext } from 'react'
import { ProductContext } from 'vtex.product-context'
import { useRuntime } from 'vtex.render-runtime'
import usePRScript from './modules/usePRScript'

const QnA =  ({ appSettings }: { appSettings: Settings }) => {

  const {
    culture: { locale }
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
        locale: "ro_RO",
        merchant_group_id: merchantGroupId,
        merchant_id: merchantId,
        page_id: product[appSettings.uniqueId],
        components: {
            QuestionSnippet: 'pr-questionsnippet',
            QuestionDisplay: 'pr-questiondisplay'
        },
      })
    }, [
      appKey,
      scriptLoaded,
      locale,
      merchantGroupId,
      merchantId,
      product[appSettings.uniqueId],
    ])

    return (
      <>
        <div id="pr-questionsnippet"></div>
        <div id="pr-questiondisplay"></div>
      </>
      )
}


export default QnA
