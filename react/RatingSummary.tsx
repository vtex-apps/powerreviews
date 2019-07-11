import React, { FunctionComponent, useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { ProductContext } from 'vtex.product-context'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import getConfig from './graphql/getConfig.gql'
import { withApollo, graphql, ChildProps, Query } from 'react-apollo'
import { Link } from 'vtex.render-runtime'

interface Settings {
  appKey: string
  uniqueId: string
  merchantId: string
  merchantGroupId: string
}
const withSettings = graphql<{ client: any }, Settings>(getConfig, {
  options: () => ({ ssr: false }),
})

const RatingSummary: FunctionComponent<
  ChildProps<Partial<RatingSummaryProps>, Settings>
> = props => {
  const { product } = useContext(ProductContext)

  const writeReviewLink =
    props.data && props.data.getConfig
      ? `/new-review?pr_page_id=${
          product[props.data.getConfig.uniqueId]
        }&pr_merchant_id=${props.data.getConfig.merchantId}&pr_api_key=${
          props.data.getConfig.appKey
        }&pr_merchant_group_id=${props.data.getConfig.merchantGroupId}`
      : ''

  return (
    <Query
      query={queryRatingSummary}
      variables={{
        sort: 'Newest',
        page: 0,
        pageId: JSON.stringify({
          linkText: product.linkText,
          productId: product.productId,
          productReference: product.productReference,
        }),
        filter: 0,
      }}
    >
      {({ data, loading }: { data: any; loading: boolean }) => {
        const rollup =
          data && data.productReviews && data.productReviews.results[0].rollup
        const rating = rollup ? rollup.average_rating : 0
        const numberOfReviews = rollup ? rollup.review_count : 0

        return (
          <Summary
            loading={loading}
            writeReviewLink={writeReviewLink}
            rating={rating}
            numberOfReviews={numberOfReviews}
          />
        )
      }}
    </Query>
  )
}

const Summary: FunctionComponent<SummaryProps> = ({
  writeReviewLink,
  loading,
  rating,
  numberOfReviews,
}) => {
  return (
    <div className="review__rating mw8 center mb5">
      <div className="review__rating--stars dib relative v-mid mr4">
        <div className="review__rating--inactive nowrap">
          {[0, 1, 2, 3, 4].map((_, i) => {
            return i <= 3 ? (
              <svg
                className="mr2"
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={'#eee'}
                viewBox="0 0 14.737 14"
              >
                <path
                  d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                  transform="translate(0)"
                />
              </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
            ) : (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={'#eee'}
                viewBox="0 0 14.737 14"
              >
                <path
                  d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                  transform="translate(0)"
                />
              </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
            )
          })}
        </div>
        <div
          className="review__rating--active nowrap overflow-hidden absolute top-0-s left-0-s"
          style={{ width: rating * 20 + '%' }}
        >
          {[0, 1, 2, 3, 4].map((_, i) => {
            // let { average } = state;

            return i <= 3 ? (
              <svg
                className="mr2"
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={rating > i ? '#fc0' : '#eee'}
                viewBox="0 0 14.737 14"
              >
                <path
                  d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                  transform="translate(0)"
                />
              </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
            ) : (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={rating > i ? '#fc0' : '#eee'}
                viewBox="0 0 14.737 14"
              >
                <path
                  d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                  transform="translate(0)"
                />
              </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
            )
          })}
        </div>
      </div>
      <span className="review__rating--average mr4 dib c-muted-2 t-body f6-s">
        (
        <FormattedMessage
          id="store/power-reviews.numberOfReviews"
          values={{ number: numberOfReviews }}
        />
        )
      </span>
      {!loading ? (
        <Link className="dib c-on-base t-body f6-s" to={writeReviewLink}>
          <FormattedMessage id="store/power-reviews.writeAReview" />
        </Link>
      ) : null}
    </div>
  )
}

interface SummaryProps {
  writeReviewLink: string
  rating: number
  numberOfReviews: number
  loading: boolean
}

interface RatingSummaryProps {
  client: any
  data: any
}

export default withApollo(withSettings(RatingSummary))
