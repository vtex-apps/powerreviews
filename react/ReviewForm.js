import React, { useEffect, useState } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import getConfig from './graphql/getConfig.graphql'
import { graphql } from 'react-apollo'

const ReviewForm = props => {
  const {
    culture: { locale },
    query,
  } = useRuntime()
  const [loaded, setLoaded] = useState(false)
  const [pageId, setPageId] = useState(null)
  const [appKey, setAppKey] = useState(null)
  const [merchantId, setMerchantId] = useState(null)
  const [merchantGroupId, setMerchantGroupId] = useState(null)

  useEffect(() => {
    if (!props.data.loading) {
      var script = document.createElement('script')
      script.onload = function() {
        setPageId(query.pr_page_id)
        setMerchantGroupId(query.pr_merchant_group_id)
        setAppKey(props.data.getConfig.appKey)
        setMerchantId(props.data.getConfig.merchantId)
        setLoaded(true)
      }
      script.src = 'https://ui.powerreviews.com/stable/4.0/ui.js'
      document.body.appendChild(script)
    }
  }, [
    props.data.getConfig.appKey,
    props.data.getConfig.merchantId,
    props.data.loading,
    query.pr_merchant_group_id,
    query.pr_page_id,
  ])

  useEffect(() => {
    if (!window.POWERREVIEWS && appKey === null) {
      // eslint-disable-next-line no-console
      console.log('POWERREVIEWS NO')
    } else {
      // eslint-disable-next-line no-console
      console.log('POWERREVIEWS SIM')

      /* eslint-disable @typescript-eslint/camelcase */
      window.POWERREVIEWS.display.render({
        api_key: appKey,
        locale: locale,
        merchant_group_id: merchantGroupId,
        merchant_id: merchantId,
        page_id: pageId,
        components: {
          Write: 'pr-write',
        },
      })
    }
  }, [appKey, loaded, locale, merchantGroupId, merchantId, pageId])

  return <div id="pr-write"></div>
}

const withGetConfig = graphql(getConfig, {
  options: () => ({
    ssr: false,
  }),
})

export default withGetConfig(ReviewForm)
