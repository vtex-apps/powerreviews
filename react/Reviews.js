import React, { 
  useContext,
  useState,
  useEffect
} from 'react'

import { ProductContext } from 'vtex.product-context'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import voteReviewQuery from './graphql/mutations/voteReview.gql'
import getConfig from './graphql/getConfig.graphql'
import { withApollo, graphql } from 'react-apollo'

import {
  IconSuccess,
  Pagination,
  Collapsible,
  Dropdown,
  Button,
} from 'vtex.styleguide'

const Reviews = props => {
  const { product } = useContext(ProductContext)
  console.log("product", product);

  const [reviews, setReviews] = useState([])
  const [average, setAverage] = useState(0)
  const [histogram, setHistogram] = useState([])
  const [count, setCount] = useState(0)
  const [percentage, setPercentage] = useState([])
  const [options, setOptions] = useState(
    [
      {
        label: 'Most Recent',
        value: 'Newest',
      },
      {
        label: 'Oldest',
        value: 'Oldest',
      },
      {
        label: 'Highest Rated',
        value: 'HighestRating',
      },
      {
        label: 'Lowest Rated',
        value: 'LowestRating',
      },
      {
        label: 'Most Helpful',
        value: 'MostHelpful',
      },
      {
        label: 'Images',
        value: 'MediaSort',
      },
    ]
  )
  const [selected, setSelected] = useState('Newest')
  const [filter, setFilter] = useState('0')
  const [filters, setFilters] = useState(
    [
      {
        label: 'Select a filter...',
        value: '0',
      },
      {
        label: '1 star',
        value: '1',
      },
      {
        label: '2 stars',
        value: '2',
      },
      {
        label: '3 stars',
        value: '3',
      },
      {
        label: '4 stars',
        value: '4',
      },
      {
        label: '5 stars',
        value: '5',
      }
    ]
  )
  const [paging, setPaging] = useState({})
  const [detailsIsOpen, setDetailsIsOpen] = useState(false)

  useEffect(() => {
    console.log("product", product);
    if (!product) return
    console.log("getting new reviews");
    getReviews('Newest')
  }, [product, props.client])

  const calculatePercentage = () => {

    let arr = []

    histogram.forEach((val, i) => {
      arr.push(((100 / count) * val).toFixed(2) + '%') // cálculo de porcentagem
    })

    arr.reverse() // o layout começa no 5, por isso do .reverse()

    setPercentage(arr)
  }

  const getReviews = (orderBy, page, filter) => {
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
          filter: parseInt(filter) || 0,
        },
      })
      .then(response => {
        let reviews = response.data.productReviews.results[0].reviews // revisar se sempre vem 1 item nesse array
        let rollup = response.data.productReviews.results[0].rollup
        let paging = response.data.productReviews.paging

        setReviews(reviews)
        setAverage(rollup != null ? rollup.average_rating : 0)
        setHistogram(rollup != null ? rollup.rating_histogram : [])
        setCount(rollup != null ? rollup.review_count : 0)
        setPaging(paging)

        calculatePercentage()
      })
  }

  const handleSort = (event, value) => {
    setSelected(value)
    getReviews(value)
  }

  const handleFilter = (event, value) => {
    const currentSort = selected
    const currentPage = 0

    setFilter(value)
    getReviews(currentSort, currentPage, value)
  }

  const handleClickNext = () => {
    goToPage(paging.current_page_number * 10)
  }

  const handleClickPrevious = () => {
    goToPage((paging.current_page_number - 2) * 10)
  }

  const getTimeAgo = time => {
    let before = new Date(parseInt(time))
    let now = new Date()
    let diff = new Date(now - before)

    let minutes = diff.getUTCMinutes()
    let hours = diff.getUTCHours()
    let days = diff.getUTCDate() - 1
    let months = diff.getUTCMonth()
    let years = diff.getUTCFullYear() - 1970

    if (years != 0) {
      return `${years} ${years > 1 ? 'years' : 'year'} ago`
    } else if (months != 0) {
      return `${months} ${months > 1 ? 'months' : 'month'} ago`
    } else if (days != 0) {
      return `${days} ${days > 1 ? 'days' : 'day'} ago`
    } else if (hours != 0) {
      return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`
    } else {
      return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`
    }
  }

  const goToPage = (page) => {
    let orderBy = selected
    const f = filter

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
          filter: parseInt(f) || 0,
        },
      })
      .then(response => {
        // eslint-disable-next-line no-console
        console.log('response goToPage', response)
        let reviews = response.data.productReviews.results[0].reviews // revisar se sempre vem 1 item nesse array
        // let rollup = response.data.productReviews.results[0].rollup;
        let paging = response.data.productReviews.paging

        setReviews(reviews)
        setPaging(paging)
      })
  }

  const voteReview = (reviewId, voteType, reviewIndex) => {
    props.client
      .mutate({
        mutation: voteReviewQuery,
        variables: { reviewId: reviewId, voteType: voteType },
      })
      .then(response => {
        // eslint-disable-next-line no-console
        console.log(response)

        const types = {
          unhelpful: 'not_helpful_votes',
          helpful: 'helpful_votes',
        }
        const metricsType = types[voteType]

        let revs = reviews
        let review = reviews[reviewIndex]
        review.metrics[metricsType] += 1
        review.disabled = true
        revs[reviewIndex] = review

        setReviews(revs)
      })
  }

  return reviews.length ? (
    <div className="review mw8 center ph5">
      <h3 className="review__title t-heading-3 bb b--muted-5 mb5">Reviews</h3>
      <div className="review__rating">
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
          {reviews.length || 0}
        </span>
      </div>
      <div className="review__histogram">
        <ul className="bg-muted-5 pa7 list">
          {percentage.map((percentage, i) => {
            return (
              <li key={i} className="mv3">
                <span className="dib w-10 v-mid">
                  {5 - i} {i < 4 ? 'stars' : 'star'}
                </span>
                <div className="review__histogram--bar bg-white dib h2 w-90 v-mid">
                  <div
                    className="review__histogram--bar-value h2 bg-yellow"
                    style={{ width: percentage }}
                  ></div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="review__comments">
        <div className="review__comments_head">
          <h4 className="review__comments_title t-heading-4 bb b--muted-5 mb5 pb4">
            Reviewed by {count}{' '}
            {count == 1 ? 'customer' : 'customers'}
          </h4>
          <div className="mb7">
            <Dropdown
              options={options}
              onChange={handleSort}
              value={selected}
              {...props}
            />
          </div>
          <div className="mb7">
            <Dropdown
              options={filters}
              onChange={handleFilter}
              value={filter}
              {...props}
            />
          </div>

          <div className="mv5">
            {!props.data.loading ? (
              <a
                href={`/new-review?pr_page_id=${
                  product[
                    props.data.getConfig.uniqueId
                  ]
                }&pr_merchant_id=${
                  props.data.getConfig.merchantId
                }&pr_api_key=${
                  props.data.getConfig.appKey
                }&pr_merchant_group_id=${
                  props.data.getConfig.merchantGroupId
                }`}
              >
                {' '}
                Write a review{' '}
              </a>
            ) : null}
          </div>
        </div>

        {reviews.map((review, i) => {
          return (
            <div
              key={i}
              className="review__comment bw2 bb b--muted-5 mb5 pb4"
            >
              <div className="review__comment--rating">
                {[0, 1, 2, 3, 4].map((_, j) => {
                  return (
                    <svg
                      className="mr3"
                      key={j}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14.737"
                      height="14"
                      fill={review.metrics.rating > j ? '#fc0' : '#eee'}
                      viewBox="0 0 14.737 14"
                    >
                      <path
                        d="M7.369,11.251,11.923,14,10.714,8.82l4.023-3.485-5.3-.449L7.369,0,5.3,4.885,0,5.335,4.023,8.82,2.815,14Z"
                        transform="translate(0)"
                      />
                    </svg> // se o review.metrics.rating for 4, preenche 4 estrelas
                  )
                })}

                <span>{review.metrics.rating}</span>
              </div>
              <h5 className="review__comment--user lh-copy mw9 t-heading-5 mv5">
                {review.details.headline}
              </h5>
              <ul className="pa0">
                {review.badges.is_verified_buyer ? (
                  <li className="dib mr5">
                    <IconSuccess /> Verified buyer
                  </li>
                ) : null}
                <li className="dib mr5">
                  <strong>Submitted</strong>{' '}
                  {getTimeAgo(review.details.created_date)}
                </li>
                <li className="dib mr5">
                  <strong>By</strong> {review.details.nickname}
                </li>
                <li className="dib">
                  <strong>From</strong> {review.details.location}
                </li>
              </ul>
              <p className="t-body lh-copy mw9">{review.details.comments}</p>
              <div>
                <h5>Was this review helpful to you?</h5>
                <Button
                  disabled={review.disabled}
                  variation="primary"
                  size="small"
                  onClick={() =>
                    voteReview(review.review_id, 'helpful', i)
                  }
                >
                  yes {review.metrics.helpful_votes}
                </Button>

                <Button
                  disabled={review.disabled}
                  variation="danger-tertiary"
                  size="small"
                  onClick={() =>
                    voteReview(review.review_id, 'unhelpful', i)
                  }
                >
                  no {review.metrics.not_helpful_votes}
                </Button>
              </div>

              <div className="review__comment_more-details mt6">
                <Collapsible
                  header={<span>More details</span>}
                  onClick={e => {
                    const reviewIndex = i

                    let revs = reviews
                    let review = reviews[reviewIndex]
                    review.showDetails = !review.showDetails
                    revs[reviewIndex] = review

                    setReviews(revs)
                  }}
                  isOpen={review.showDetails}
                >
                  <div className="flex flex-wrap mt5 justify-between-s">
                    {review.details.properties.map((item, i) => {
                      return (
                        <div key={i} className="w30">
                          <h5 className="t-heading-5 ma0">{item.label}</h5>
                          {item.value.length ? (
                            <ul className="pa0 list">
                              {item.value.map((val, j) => {
                                return <li key={j}>{val}</li>
                              })}
                            </ul>
                          ) : null}
                        </div>
                      )
                    })}
                    {review.details.bottom_line ? (
                      <div className="w30">
                        <h5 className="t-heading-5 ma0">Bottom Line</h5>
                        <p>
                          {review.details.bottom_line}, I would{' '}
                          {review.details.bottom_line == 'No' ? 'not ' : ''}
                          recommend to a friend
                        </p>
                      </div>
                    ) : null}
                  </div>
                </Collapsible>
              </div>

              {review.media.length ? (
                <div className="review__comment-images mt6">
                  {review.media.map((item, i) => {
                    return (
                      <img
                        alt=""
                        className="w-20 db mb5"
                        key={i}
                        src={item.uri}
                      />
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="review__paging">
        <Pagination
          currentItemFrom={
            1 +
            (paging.current_page_number - 1) *
              paging.page_size
          }
          currentItemTo={
            paging.current_page_number *
            paging.page_size
          }
          textOf="of"
          totalItems={paging.total_results}
          onNextClick={handleClickNext}
          onPrevClick={handleClickPrevious}
        />
      </div>
    </div>
  ) : (
    <div className="review mw8 center ph5">
      <h3 className="review__title t-heading-3 bb b--muted-5 mb5">Reviews</h3>
      <div className="review__comments">
        <div className="review__comments_head">
          <h4 className="review__comments_title t-heading-4 bb b--muted-5 mb5 pb4">
            Reviewed by {count}{' '}
            {count == 1 ? 'customer' : 'customers'}
          </h4>
          <div className="mb7">
            <Dropdown
              options={options}
              onChange={handleSort}
              value={selected}
              {...props}
            />
          </div>
          <div className="mb7">
            <Dropdown
              options={filters}
              onChange={handleFilter}
              value={filter}
              {...props}
            />
          </div>

          <div className="mv5">
            {!props.data.loading ? (
              <a
                href={`/new-review?pr_page_id=${
                  product[
                    props.data.getConfig.uniqueId
                  ]
                }&pr_merchant_id=${
                  props.data.getConfig.merchantId
                }&pr_api_key=${
                  props.data.getConfig.appKey
                }&pr_merchant_group_id=${
                  props.data.getConfig.merchantGroupId
                }`}
              >
                Write a review
              </a>
            ) : null}
          </div>

          <div className="review__comment bw2 bb b--muted-5 mb5 pb4">
            <h5 className="review__comment--user lh-copy mw9 t-heading-5 mv5">
              No reviews found!
            </h5>
          </div>
        </div>
      </div>
    </div>
  )

}

const withGetConfig = graphql(getConfig, {
  options: () => ({
    ssr: false,
  }),
})

export default withApollo(withGetConfig(Reviews))
