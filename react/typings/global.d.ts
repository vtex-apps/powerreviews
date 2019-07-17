interface Window extends Window {
  __powerReviews: {
    appKey: string
    merchantId: string
    merchantGroupId: string
    uniqueId: string
  }
  POWERREVIEWS: PowerReviewsClient
}

// Docs: https://help.powerreviews.com/Content/Post%20Purchase%20Email/Checkout%20Beacon.htm
interface PowerReviewsClient {
  display: {
    render: (params: RenderParams) => void
  }
  tracker: {
    createTracker: (params: { merchantGroupId: string }) => PowerReviewsTracker
  }
}

interface PowerReviewsTracker {
  trackCheckout: (orderFeed: OrderFeed) => void
}

interface OrderFeed {
  merchantGroupId: string
  merchantId: string
  locale: string
  merchantUserId?: string
  marketingOptIn: boolean
  userEmail: string
  userFirstName: string
  userLastName: string
  orderId: string
  orderSubtotal: number
  orderNumberOfItems: number
  orderItems: OrderFeedItem[]
}

interface OrderFeedItem {
  page_id: string
  page_id_variant?: string
  product_name?: string
  quantity: number
  unit_price: number
}

interface RenderParams {
  api_key: string
  locale: string
  merchant_group_id: string
  merchant_id: string
  page_id: string
  components: any
}
