import axios from 'axios';
import { Apps } from '@vtex/api';
const _vtexProxy = (url:any) => {
  return url
    .replace('https', 'http')
    // .replace(/(:\d+)/g, '')
}

export const queries = {
    productReviews: async (_:any, args:any, ctx:any) => {

        const { sort, page, pageId, filter } = args;

        const {appKey, merchantId, uniqueId} =  await queries.getConfig(null, null, ctx);

        const product = JSON.parse(pageId);

        const fieldProductId = product[uniqueId];
        // const fieldProductId = "patagn-p-6_logo_responsibili-tee_mens";


        // const pageId2 = product.linkText;//"patagn-p-6_logo_responsibili-tee_mens";

        // const apps = new Apps(ctx.vtex)
        // const app = process.env.VTEX_APP_ID
        // const settings = await apps.getAppSettings(app)
        console.log(">>pageId", product)
        console.log("ctx", ctx.vtex);
        console.log("FILTER: ", filter)

        const endpoint = `https://display.powerreviews.com/m/${merchantId}/l/en_US/product/${fieldProductId}/reviews?apikey=${appKey}&sort=${sort}&paging.size=10&paging.from=${page}${filter ? '&filters=rating:'+filter : ''}`
        console.log(endpoint)
        const requestOptions = {
            'headers': {
                'Proxy-Authorization': ctx.vtex.authToken,
                'X-Vtex-Proxy-To': endpoint,
                'X-Vtex-Use-Https': true,
                'Cache-Control': 'no-cache'
            }
        }

        let reviews: any
        try {
            reviews = await axios.get(_vtexProxy(endpoint), requestOptions)
        } catch (error) {
            throw new TypeError(error.response.data)
        }

        console.log(reviews)
        return reviews.data
    },
    getConfig: async (_:any, __:any, ctx:any) => {
        const apps = new Apps(ctx.vtex)
        const app = "vtex.io-reviews"
        const settings = await apps.getAppSettings(app)
        console.log("SETTINGS ", settings)
        return settings
    },

}

export const resolvers = {

    voteReview: async (_:any, args:any, ctx:any) => {

        const { reviewId, voteType } = args;

        const {merchantId} =  await queries.getConfig(null, null, ctx);

        const endpoint = `https://writeservices.powerreviews.com/voteugc`
        const requestOptions = {
            'headers': {
                'Proxy-Authorization': ctx.vtex.authToken,
                'X-Vtex-Proxy-To': endpoint,
                'X-Vtex-Use-Https': true
            },
            'data': {
                'merchant_id': merchantId,
                'ugc_id': reviewId,
                'vote_type': voteType
            }
        }

        let response: any
        try {
            response = await axios.post(_vtexProxy(endpoint), requestOptions)
        } catch (error) {
            throw new TypeError(error.response.data)
        }

        return response.data
    }
}
