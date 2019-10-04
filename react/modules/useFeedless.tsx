import { useEffect, useContext } from 'react'
import { path } from 'ramda'
import { ProductContext, IProductContext, Seller } from 'vtex.product-context'
import { useRuntime } from 'vtex.render-runtime'
import usePRScript from './usePRScript'

// Implement the Feedless feature described here:
// https://help.powerreviews.com/Content/Product%20Catalog/Feedless.htm
export default function useFeedless(settings: Settings) {
  const scriptLoaded = usePRScript()
  const { culture: { locale } } = useRuntime()
  const { product, selectedItem } = useContext<IProductContext>(ProductContext)

  useEffect(() => {
    if (!window.POWERREVIEWS || scriptLoaded === false || !settings || !settings.appKey || !product || !product.productName) {
      return
    }

    const selectedSeller = path(['sellers', 0], selectedItem) as Seller
    const availability = selectedSeller &&
        selectedSeller.commertialOffer &&
        selectedSeller.commertialOffer.AvailableQuantity
      ? selectedSeller.commertialOffer.AvailableQuantity > 0
      : false

    const canonical = document.querySelector('link[rel=canonical]') as HTMLLinkElement
    const url = canonical ? canonical.href : window.location.href

    /* eslint-disable @typescript-eslint/camelcase */
    window.POWERREVIEWS.display.render({
      api_key: settings.appKey,
      locale: locale,
      merchant_group_id: settings.merchantGroupId,
      merchant_id: settings.merchantId,
      page_id: product[settings.uniqueId],
      product:{
        name: product.productName, 
        url: url,
        image_url: path(['images', '0', 'imageUrl'], selectedItem),
        description: product.description,
        category_name: product.categories && product.categories.length > 0
          ? product.categories[0].slice(1, -1).replace(/\//gi, ' > ')
          : '',
        upc: path(['ean'], selectedItem),
        brand_name: product.brand,
        price: path(['commertialOffer', 'Price'], selectedSeller),
        in_stock: availability,
      },
    })
  }, [scriptLoaded, settings, product])
}

interface Settings {
  uniqueId: 'productReference' | 'ean' | 'linkText'
  merchantId: any
  appKey: string
  merchantGroupId: string
}
