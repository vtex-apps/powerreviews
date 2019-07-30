import React, { useEffect, useState } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import getConfig from './graphql/getConfig.gql'
import { graphql } from 'react-apollo'

const ReviewForm = props => {
  const {
    culture: { locale },
    query,
  } = useRuntime()
  const [loaded, setLoaded] = useState(false)
  const [pageId, setPageId] = useState(null)
  const { appKey, merchantId, merchantGroupId } = props.data.getConfig || {}

  useEffect(() => {
    if (!props.data.loading) {
      var script = document.createElement('script')
      script.onload = function() {
        setPageId(query.pr_page_id)
        setLoaded(true)
      }
      script.src = 'https://ui.powerreviews.com/stable/4.0/ui.js'
      document.body.appendChild(script)
    }
  }, [
    appKey,
    merchantId,
    merchantGroupId,
    props.data.loading,
    query.pr_page_id,
  ])

  useEffect(() => {
    if (!window.POWERREVIEWS || loaded === false) {
      return
    }

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
  }, [appKey, loaded, locale, merchantGroupId, merchantId, pageId])

  return <div id="pr-write"></div>
}

const withGetConfig = graphql(getConfig, {
  options: () => ({
    ssr: false,
  }),
})

export default withGetConfig(ReviewForm)
