import React, { FunctionComponent, useContext } from 'react'
import { FormattedMessage } from 'react-intl'
import { ProductContext } from 'vtex.product-context'
import Stars from './components/Stars'
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
    props.data && props.data.getConfig && product
      ? `/new-review?pr_page_id=${
          product[props.data.getConfig.uniqueId]
        }&pr_merchant_id=${props.data.getConfig.merchantId}&pr_api_key=${
          props.data.getConfig.appKey
        }&pr_merchant_group_id=${props.data.getConfig.merchantGroupId}`
      : ''

  if (!product) {
    return (
      <Summary
        loading
        writeReviewLink={writeReviewLink}
        rating={0}
        numberOfReviews={0}
      />
    )
  }

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
      <Stars rating={rating} />
      <a
        href="#all-reviews"
        className="review__rating--average mr4 dib c-muted-2 t-body f6-s"
      >
        (
        <FormattedMessage
          id="store/power-reviews.numberOfReviews"
          values={{ number: numberOfReviews }}
        />
        )
      </a>
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
