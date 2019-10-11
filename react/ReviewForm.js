import React, { useEffect, useState } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import getConfig from './graphql/getConfig.gql'
import usePRScript from './modules/usePRScript'
import { graphql } from 'react-apollo'

const ReviewForm = props => {
  const {
    culture: { locale },
    query,
  } = useRuntime()
  const { appKey, merchantId, merchantGroupId } = props.data.getConfig || {}

  const scriptLoaded = usePRScript()

  useEffect(() => {
    if (!window.POWERREVIEWS || scriptLoaded === false) {
      return
    }

    /* eslint-disable @typescript-eslint/camelcase */
    window.POWERREVIEWS.display.render({
      api_key: appKey,
      locale: locale,
      merchant_group_id: merchantGroupId,
      merchant_id: merchantId,
      page_id: query.pr_page_id,
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
  ])

  return <div id="pr-write"></div>
}

const withGetConfig = graphql(getConfig, {
  options: () => ({
    ssr: false,
  }),
})

export default withGetConfig(ReviewForm)
