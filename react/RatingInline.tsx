import React, { FunctionComponent, useState, useEffect } from 'react'
import { useProductSummary } from 'vtex.product-summary-context/ProductSummaryContext'
import Stars from './components/Stars'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import { withApollo } from 'react-apollo'

const RatingInline: FunctionComponent<RatingInlineProps> = props => {
  const { product } = useProductSummary()

  const [count, setCount] = useState(0)
  const [reviews, setReviews] = useState([])
  const [average, setAverage] = useState(0)

  useEffect(() => {
    const getReviews = (orderBy: any, page: any) => {
      props.client
        .query({
          query: queryRatingSummary,
          variables: {
            sort: orderBy,
            page: page || 0,
            pageId: JSON.stringify({
              linkText: product.linkText,
              productId: product.productId,
              productReference: product.productReference,
            }),
          },
        })
        .then((response: any) => {
          const results = response.data.productReviews.results

          if (results.length) {
            let reviews = results[0].reviews
            let rollup = results[0].rollup

            setReviews(reviews)
            setAverage(rollup != null ? rollup.average_rating : 0)
          }

          setCount(count + 1)
        })
    }

    if (product) {
      if (count == 0) {
        getReviews('Newest', 0)
      }
    }
  }, [count, product, props.client])

  return (
    <div className="review__rating mw8 center ph5">
      <Stars rating={reviews.length ? average : 0} />
    </div>
  )
}

interface RatingInlineProps {
  productQuery: any
  client: any
}

export default withApollo(RatingInline)
