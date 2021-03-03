/* eslint-disable @typescript-eslint/camelcase */
import { canUseDOM } from 'vtex.render-runtime'
import { PixelMessage } from './typings/events'

let scriptLoad: Promise<{}> | null = null

function loadScript() {
  if (!scriptLoad) {
    scriptLoad = new Promise((resolve, reject) => {
      const element = document.createElement('script')
      element.type = 'text/javascript'
      element.onload = () => {
        resolve({})
      }
      element.onerror = () => {
        reject()
      }
      element.src = '//static.powerreviews.com/t/v1/tracker.js'
      const parent = document.getElementsByTagName('script')[0]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parent.parentNode!.insertBefore(element, parent)
    })
  }
  return scriptLoad
}

if (canUseDOM) {
  // Load script when it's orderPlaced
  if (window.location.pathname.indexOf('checkout/orderPlaced') !== -1) {
    loadScript()
  }
}

const handleMessages = (e: PixelMessage) => {
  switch (e.data.event) {
    case 'orderPlaced': {
      const data = e.data

      loadScript().then(() => {
        try {
          const {
            merchantId,
            merchantGroupId,
            uniqueId,
          } = window.__powerReviews

          const tracker = window.POWERREVIEWS.tracker.createTracker({
            merchantGroupId,
          })

          const localeMeta = document.querySelector(
            'meta[name=language'
          ) as HTMLMetaElement

          const locale = localeMeta ? localeMeta.content : 'en-US'

          const orderFeed = {
            merchantGroupId,
            merchantId,
            locale: locale.replace('-', '_'),

            userEmail: data.visitorContactInfo[0],
            userFirstName: data.visitorContactInfo[1],
            userLastName: data.visitorContactInfo[2],

            marketingOptIn: data.visitorOptinNewsletter,

            orderId: data.orderGroup,
            orderSubtotal: data.transactionSubtotal,
            orderNumberOfItems: data.transactionProducts.length,
            orderItems: data.transactionProducts.map(product => {
              type ProductField = 'id' | 'slug' | 'productRefId'

              const mapUniqueIdToCheckoutField: Record<string, ProductField> = {
                productId: 'id',
                linkText: 'slug',
                productReference: 'productRefId',
              }

              const field = mapUniqueIdToCheckoutField[uniqueId]

              return {
                page_id: product[field],
                product_name: encodeURI(product.name),
                quantity: product.quantity,
                unit_price: product.price,
              }
            }),
          }

          tracker.trackCheckout(orderFeed)
        } catch (e) {
          window.console &&
            window.console.log('PowerReviews Track Checkout error', e)
        }
      })
    }
  }
}

if (canUseDOM) {
  window.addEventListener('message', handleMessages)
}
