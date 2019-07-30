import React, { useContext, useEffect, useCallback, useReducer } from 'react'
import { ProductContext } from 'vtex.product-context'
import Stars from './components/Stars'
import queryRatingSummary from './graphql/queries/queryRatingSummary.gql'
import voteReviewQuery from './graphql/mutations/voteReview.gql'
import getConfig from './graphql/getConfig.gql'
import { withApollo, graphql } from 'react-apollo'

import {
  IconSuccess,
  Pagination,
  Collapsible,
  Dropdown,
  Button,
} from 'vtex.styleguide'

const options = [
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

const filters = [
  {
    label: 'All',
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
  },
]

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

const initialState = {
  reviews: null,
  average: 0,
  histogram: [],
  count: 0,
  percentage: [],
  selected: 'Newest',
  filter: '0',
  paging: {},
  page: 0,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_REVIEWS': {
      return {
        ...state,
        reviews: action.reviews,
        average: action.average,
        histogram: action.histogram,
        percentage: action.percentage,
        count: action.count,
        paging: action.paging,
      }
    }
    case 'SET_SELECTED_SORT': {
      return {
        ...state,
        selected: action.selectedSort,
      }
    }
    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.filter,
        page: 0,
      }
    }
    case 'SET_NEXT_PAGE': {
      return {
        ...state,
        page: state.paging.current_page_number * 10,
      }
    }
    case 'SET_PREVIOUS_PAGE': {
      return {
        ...state,
        page: (state.paging.current_page_number - 2) * 10,
      }
    }
    case 'VOTE_REVIEW': {
      return {
        ...state,
        reviews: state.reviews.map((review, index) => {
          if (index === action.reviewIndex) {
            const types = {
              unhelpful: 'not_helpful_votes',
              helpful: 'helpful_votes',
            }
            const metricsType = types[action.voteType]

            return {
              ...review,
              disabled: true,
              metrics: {
                ...review.metrics,
                [metricsType]: (review.metrics[metricsType] += 1),
              },
            }
          }

          return review
        }),
      }
    }
    case 'TOGGLE_REVIEW_DETAILS': {
      return {
        ...state,
        reviews: state.reviews.map((review, index) => {
          if (index === action.reviewIndex) {
            return {
              ...review,
              showDetails: !review.showDetails,
            }
          }

          return review
        }),
      }
    }
  }
}

const Reviews = props => {
  const { product } = useContext(ProductContext)
  const { linkText, productId, productReference } = product || {}

  const [state, dispatch] = useReducer(reducer, initialState)
  const { filter, selected, page, count, histogram, average } = state

  useEffect(() => {
    if (!linkText && !productId && !productReference) {
      return
    }

    props.client
      .query({
        query: queryRatingSummary,
        variables: {
          sort: selected,
          page: page,
          pageId: JSON.stringify({
            linkText: linkText,
            productId: productId,
            productReference: productReference,
          }),
          filter: parseInt(filter) || 0,
        },
      })
      .then(response => {
        // revisar se sempre vem 1 item nesse array
        const reviews = response.data.productReviews.results[0].reviews
        const rollup = response.data.productReviews.results[0].rollup
        const paging = response.data.productReviews.paging

        const hasNewHistogram = rollup != null && rollup.rating_histogram
        const currentHistogram = hasNewHistogram
          ? rollup.rating_histogram
          : histogram

        const hasNewCount = rollup != null && rollup.review_count != null
        const currentCount = hasNewCount ? rollup.review_count : count

        const hasNewAverage = rollup != null && rollup.average_rating != null
        const currentAverage = hasNewAverage ? rollup.average_rating : average

        let percentage = []
        currentHistogram.forEach(val => {
          percentage.push(((100 / currentCount) * val).toFixed(2) + '%') // cálculo de porcentagem
        })
        percentage.reverse() // o layout começa no 5, por isso do .reverse()

        dispatch({
          type: 'SET_REVIEWS',
          reviews,
          average: currentAverage,
          histogram: currentHistogram,
          count: currentCount,
          paging,
          percentage,
        })
      })
  }, [
    filter,
    selected,
    page,
    count,
    histogram,
    average,
    linkText,
    productId,
    productReference,
    props.client,
  ])

  const voteReview = useCallback(
    (reviewId, voteType, reviewIndex) => {
      props.client
        .mutate({
          mutation: voteReviewQuery,
          variables: { reviewId: reviewId, voteType: voteType },
        })
        .then(() => {
          dispatch({
            type: 'VOTE_REVIEW',
            reviewIndex,
            voteType,
          })
        })
    },
    [props.client]
  )

  const handleSort = useCallback(
    (event, value) => {
      dispatch({
        type: 'SET_SELECTED_SORT',
        selectedSort: value,
      })
    },
    [dispatch]
  )

  const handleFilter = useCallback(
    (event, value) => {
      dispatch({
        type: 'SET_FILTER',
        filter: value,
      })
    },
    [dispatch]
  )

  const handleClickNext = useCallback(() => {
    dispatch({
      type: 'SET_NEXT_PAGE',
    })
  }, [dispatch])

  const handleClickPrevious = useCallback(() => {
    dispatch({
      type: 'SET_PREVIOUS_PAGE',
    })
  }, [dispatch])

  if (state.reviews === null) {
    return <div className="review mw8 center ph5">Loading reviews</div>
  }

  return state.reviews.length ? (
    <div className="review mw8 center ph5" id="all-reviews">
      <h3 className="review__title t-heading-3 bb b--muted-5 mb5">Reviews</h3>
      <div className="review__rating">
        <Stars rating={state.average} />
        <span className="review__rating--average dib v-mid">{average}</span>
      </div>
      <div className="review__histogram">
        <ul className="bg-muted-5 pa7 list">
          {state.percentage.map((percentage, i) => {
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
            Reviewed by {state.count}{' '}
            {state.count == 1 ? 'customer' : 'customers'}
          </h4>
          <div className="flex mb7">
            <div className="mr4">
              <Dropdown
                options={options}
                onChange={handleSort}
                value={state.selected}
              />
            </div>
            <div className="">
              <Dropdown
                options={filters}
                onChange={handleFilter}
                value={state.filter}
              />
            </div>
          </div>

          <div className="mv5">
            {!props.data.loading ? (
              <a
                href={`/new-review?pr_page_id=${
                  product[props.data.getConfig.uniqueId]
                }`}
              >
                {' '}
                Write a review{' '}
              </a>
            ) : null}
          </div>
        </div>

        {state.reviews.map((review, i) => {
          return (
            <div key={i} className="review__comment bw2 bb b--muted-5 mb5 pb4">
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
                  onClick={() => voteReview(review.review_id, 'helpful', i)}
                >
                  yes {review.metrics.helpful_votes}
                </Button>

                <Button
                  disabled={review.disabled}
                  variation="danger-tertiary"
                  size="small"
                  onClick={() => voteReview(review.review_id, 'unhelpful', i)}
                >
                  no {review.metrics.not_helpful_votes}
                </Button>
              </div>

              <div className="review__comment_more-details mt6">
                <Collapsible
                  header={<span>More details</span>}
                  onClick={e => {
                    dispatch({
                      type: 'TOGGLE_REVIEW_DETAILS',
                      reviewIndex: i,
                    })
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
            1 + (state.paging.current_page_number - 1) * state.paging.page_size
          }
          currentItemTo={
            state.paging.current_page_number * state.paging.page_size
          }
          textOf="of"
          totalItems={state.paging.total_results}
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
            Reviewed by {state.count}{' '}
            {state.count == 1 ? 'customer' : 'customers'}
          </h4>
          <div className="flex mb7">
            <div className="mr4">
              <Dropdown
                options={options}
                onChange={handleSort}
                value={state.selected}
              />
            </div>
            <div>
              <Dropdown
                options={filters}
                onChange={handleFilter}
                value={state.filter}
              />
            </div>
          </div>

          <div className="mv5">
            {!props.data.loading ? (
              <a
                href={`/new-review?pr_page_id=${
                  product[props.data.getConfig.uniqueId]
                }`}
              >
                Write a review
              </a>
            ) : null}
          </div>

          <div className="review__comment bw2 bb b--muted-5 mb5 pb4">
            <h5 className="review__comment--user lh-copy mw9 t-heading-5 mv5">
              No reviews.
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
