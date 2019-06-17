import React, {
  FunctionComponent,
  useContext,
  useState,
  useEffect,
} from 'react'
import { ProductContext } from 'vtex.product-context'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import { withApollo } from 'react-apollo'

const Reviews: FunctionComponent<ReviewProps> = props => {
  const { product } = useContext(ProductContext)

  const [reviews, setReviews] = useState([])
  const [average, setAverage] = useState(0)
  const [histogram, setHistogram] = useState([])
  const [count, setCount] = useState(0)
  const [percentage, setPercentage] = useState([])
  const [selected, setSelected] = useState('Newest')
  const [paging, setPaging] = useState({})
  const [detailsIsOpen, setDetailsIsOpen] = useState(false)
  const [alreadyReviews, setAlreadyReviews] = useState(false)

  useEffect(() => {
    if (product) {
      getReviews('Newest', 0)
    }
  }, [product])

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
          filter: 0,
        },
      })
      .then((response: any) => {
        console.log('RESPONSE: ', response)
        let reviews = response.data.productReviews.results[0].reviews // revisar se sempre vem 1 item nesse array
        let rollup = response.data.productReviews.results[0].rollup
        let paging = response.data.productReviews.paging

        setReviews(reviews)
        setAverage(rollup != null ? rollup.average_rating : 0)
        setHistogram(rollup != null ? rollup.rating_histogram : [])
        setCount(rollup != null ? rollup.review_count : 0)
        setPaging(paging)
        setAlreadyReviews(reviews.length ? true : false)
        // this.setState({
        //   reviews: reviews,
        //   average: (rollup != null) ? rollup.average_rating : 0,
        //   histogram: (rollup != null) ? rollup.rating_histogram : [],
        //   count: (rollup != null) ? rollup.review_count : 0,
        //   paging: paging,
        //   alreadyReviews: reviews.length ? true : false
        // });

        //this.calculatePercentage();
      })
      .catch((error: any) => {
        console.log('ERROR: ', error)
      })
  }

  return alreadyReviews ? (
    <div className="review__rating mw8 center ph5">
      <div className="review__rating--stars dib relative v-mid mr2">
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
          style={{ width: average * 20 + '%' }}
        >
          {[0, 1, 2, 3, 4].map((_, i) => {
            // let { average } = this.state;

            return i <= 3 ? (
              <svg
                className="mr2"
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={average > i ? '#fc0' : '#eee'}
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
                fill={average > i ? '#fc0' : '#eee'}
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
      <span className="review__rating--average dib v-mid">
        {average.toFixed(1)}
      </span>
    </div>
  ) : (
    <div className="review__rating mw8 center ph5">
      <div className="review__rating--stars dib relative v-mid mr2">
        <div className="review__rating--inactive nowrap">
          {[0, 1, 2, 3, 4].map((_, i) => {
            return (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="#eee"
                viewBox="0 0 14.737 14"
              >
                <path
                  d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                  transform="translate(0)"
                ></path>
              </svg>
            )
          })}
        </div>
      </div>
      <span className="review__rating--average dib v-mid">0</span>
    </div>
  )
}

interface ReviewProps {
  client: any
}

export default withApollo(Reviews)
