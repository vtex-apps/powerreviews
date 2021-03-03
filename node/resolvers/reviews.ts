/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import { Apps } from '@vtex/api'

const _vtexProxy = (url: string) => {
  return url.replace('https', 'http')
}

declare var process: {
  env: {
    VTEX_APP_ID: string
  }
}

async function getConfig(ctx: any) {
  const apps = new Apps(ctx.vtex)
  const appId = process.env.VTEX_APP_ID
  const settings = await apps.getAppSettings(appId)
  return settings
}

export const queries = {
  productReviews: async (_: any, args: any, ctx: any) => {
    const { sort, page, pageId, filter } = args

    const { appKey, merchantId, uniqueId } = await getConfig(ctx)

    if (!appKey || !merchantId || !uniqueId)
      return { results: [{ reviews: [], rollup: null }] }

    const product = JSON.parse(pageId)

    const fieldProductId = product[uniqueId]
    const locale = ctx.header['x-vtex-tenant']
      ? ctx.header['x-vtex-tenant']
      : 'en-US'
    const endpoint = `https://display.powerreviews.com/m/${merchantId}/l/${locale.replace(
      '-',
      '_'
    )}/product/${fieldProductId}/reviews?apikey=${appKey}&sort=${sort}&paging.size=10&paging.from=${page}${
      filter ? '&filters=rating:' + filter : ''
    }`
    const requestOptions = {
      headers: {
        'Proxy-Authorization': ctx.vtex.authToken,
        'X-Vtex-Proxy-To': endpoint,
        'X-Vtex-Use-Https': true,
        'Cache-Control': 'no-cache',
      },
    }

    let reviews: any
    try {
      reviews = await axios.get(_vtexProxy(endpoint), requestOptions)
    } catch (error) {
      throw new TypeError(error.response.data)
    }

    return reviews.data
  },
}

export const mutations = {
  voteReview: async (_: any, args: any, ctx: any) => {
    const { reviewId, voteType } = args

    const { merchantId } = await getConfig(ctx)

    const endpoint = `https://writeservices.powerreviews.com/voteugc`
    const requestOptions = {
      headers: {
        'Proxy-Authorization': ctx.vtex.authToken,
        'X-Vtex-Proxy-To': endpoint,
        'X-Vtex-Use-Https': true,
      },
      data: {
        merchant_id: merchantId,
        ugc_id: reviewId,
        vote_type: voteType,
      },
    }

    let response: any
    try {
      response = await axios.post(_vtexProxy(endpoint), requestOptions)
    } catch (error) {
      throw new TypeError(error.response.data)
    }

    return response.data
  },
}
