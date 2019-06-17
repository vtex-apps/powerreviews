import React, { FunctionComponent, useEffect, useState } from 'react';
import { useRuntime } from 'vtex.render-runtime';
import getConfig from './graphql/getConfig.graphql'
import { graphql, compose, Query } from 'react-apollo'


const ReviewForm = (props) => {
  const { culture: { locale }, query, getSettings } = useRuntime()
  const [loaded, setLoaded] = useState(false)
  const [pageId, setPageId] = useState(null)
  const [appKey, setAppKey] = useState(null)
  const [merchantId, setMerchantId] = useState(null)
  const [merchantGroupId, setMerchantGroupId] = useState(null)


  console.log("PROPS ", props);
  console.log("QUERY ", query)
  
 
  useEffect(() => {
  
    if(!props.data.loading) {

      var script = document.createElement('script')
      script.onload = function () {
        
        setPageId(query.pr_page_id)
        setMerchantGroupId(query.pr_merchant_group_id)
        setAppKey(props.data.getConfig.appKey)
        setMerchantId(props.data.getConfig.merchantId)
        setLoaded(true)
      }
      script.src = 'https://ui.powerreviews.com/stable/4.0/ui.js'
      document.body.appendChild(script);

    }

  }, [props.data.loading])


  useEffect(() => {

    if (!window.POWERREVIEWS && appKey === null) { 
      console.log("POWERREVIEWS NO") 
    } else {
      console.log("POWERREVIEWS SIM") 

      window.POWERREVIEWS.display.render({
        api_key: appKey,
        locale: locale,
        merchant_group_id: merchantGroupId,
        merchant_id: merchantId,
        page_id: pageId,
        // page_id_variant: PAGE_ID_VARIANT, //only required if specifying a Page ID variant
        components: {
          Write: 'pr-write'
        }
      });

    }

  }, [loaded])

  return (
    
    <div id="pr-write"></div>

  )
}

const withGetConfig = graphql(getConfig, {
  options:() => ({
    ssr: false,
  })
})

export default withGetConfig(ReviewForm)
