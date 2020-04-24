import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import PageTitle from "../components/pagetitle"
import Breadcrumbs from "../components/breadcrumbs"
import TextBlock from "../components/textblock"
import BlockButton from "../components/blockbutton"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookmark } from "@fortawesome/free-regular-svg-icons"
import { faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons"
import BookmarkManager from "../utils/bookmarkManager"
import { spacing } from "../utils/styles"
import LargeButton from "../components/largebutton"
import PaginationBar from "../components/paginationbar"
import { PaginationObject } from "../utils/pagination"

import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons"
import { faThumbsDown } from "@fortawesome/free-solid-svg-icons"
import Section from "../components/section"
import TabList from "../components/tablist"
import Notification from "../components/notification"

import Feedback from "../utils/feedback"
import FeedbackScreen from "../components/feedbackscreen"

import WebChat from "../utils/webchat"
import anchorScroll from "../utils/anchorscroll"
import { createHistory } from "@reach/router"

import { css } from "@emotion/core"
import { getTimeAgoPublished } from "../utils/time"

import { transformSources, htmlSanitize } from "../utils/contenttransforms"
const bookmarkNotificationText = "Article added to bookmarks"
const unbookmarkNotificationText = "Article removed from bookmarks"
const feedbackNotificationText = "Thank you for your feedback"

export default class Article extends React.Component {
  constructor(props) {
    super(props)
    this.props = props

    this.bookmarkPage = this.bookmarkPage.bind(this)
    this.unBookmarkPage = this.unBookmarkPage.bind(this)
    this.givePositiveFeedback = this.givePositiveFeedback.bind(this)
    this.submitNegativeFeedback = this.submitNegativeFeedback.bind(this)
    this.openNegativeFeedbackScreen = this.openNegativeFeedbackScreen.bind(this)
    this.closeNegativeFeedbackScreen = this.closeNegativeFeedbackScreen.bind(
      this
    )

    if (typeof window !== "undefined") {
      let history = createHistory(global.window)
      anchorScroll(history)
    }

    let paginator = new PaginationObject()
    this.updatePagination = this.updatePagination.bind(this)

    this.bookmarkManager = new BookmarkManager()
    this.state = {
      paginator: paginator,
      bookmarked: this.bookmarkManager.isPageBookmarked(
        this.props.pageContext.title
      ),
      notificationText: "",
      notificationId: 0,
      notificationShowing: false,
      feedbackOpen: false,
      feedbackGiven: null
    }

    this.webchatEnabled =
      this.props.data.markdownRemark &&
      this.props.data.markdownRemark.frontmatter.tags &&
      this.props.data.markdownRemark.frontmatter.tags.includes("webchat")
  }

  updatePagination(pageTarget) {
    this.state.paginator.goToPage(pageTarget)
    // update state to get page to rerender
    this.setState({
      paginator: this.state.paginator
    })
  }

  givePositiveFeedback() {
    Feedback.articleIsUseful(this.props.pageContext.title)
    this.setState({
      notificationText: feedbackNotificationText,
      notificationId: this.state.notificationId + 1,
      notificationShowing: true,
      feedbackGiven: "positive"
    })
  }

  openNegativeFeedbackScreen() {
    this.setState({
      feedbackOpen: true
    })
  }

  closeNegativeFeedbackScreen() {
    this.setState({
      feedbackOpen: false
    })
  }

  submitNegativeFeedback() {
    let feedback = document.getElementById("feedBackContent").value
    Feedback.articleIsNotUseful(this.props.pageContext.title, feedback)
    this.setState({
      notificationText: feedbackNotificationText,
      notificationId: this.state.notificationId + 1,
      notificationShowing: true,
      feedbackGiven: "negative"
    })
    this.closeNegativeFeedbackScreen()
  }

  bookmarkPage() {
    Feedback.articleWasBookmarked(this.props.pageContext.title)
    this.bookmarkManager.bookmarkPage(this.props.pageContext.title)
    this.setState({
      bookmarked: true,
      notificationId: this.state.notificationId + 1,
      notificationText: bookmarkNotificationText,
      notificationShowing: true
    })
  }

  unBookmarkPage() {
    Feedback.articleWasUnBookmarked(this.props.pageContext.title)
    this.bookmarkManager.unBookmarkPage(this.props.pageContext.title)
    this.setState({
      notificationId: this.state.notificationId + 1,
      bookmarked: false,
      notificationText: unbookmarkNotificationText,
      notificationShowing: true
    })
  }

  render() {
    let { data, pageContext } = this.props
    const post = data.markdownRemark
    let bookmarked = this.state.bookmarked

    let otherPeers = pageContext.peers.filter(
      peer => peer.title !== pageContext.title
    )

    let peerEdges = otherPeers
      .map(peer => {
        return data.allMarkdownRemark.edges.find(
          edge => edge.node.frontmatter.title === peer.title
        )
      })
      .filter(peer => peer !== undefined)

      let paginatedPeerEdges = this.state.paginator.filterResults(peerEdges)

    let articleContent = post
      ? transformSources(post.html)
      : "Article content not found. Please Report."

    return (
      <div>
        <Layout phone_link={true}>
          <Breadcrumbs
            breadcrumbs={pageContext.breadcrumbs}
            peers={pageContext.peers}
            thisPage={pageContext.title}
          />
          <div
            css={css`
              background-color: white;
            `}
          >
            <PageTitle
              pageType="article"
              subtitle={
                post && (
                  <span>
                    Last updated:
                    <i>{" " + getTimeAgoPublished(post.frontmatter.date)}</i>
                  </span>
                )
              }
            >
              {pageContext.title}
            </PageTitle>

            {!bookmarked && (
              <BlockButton
                icon={<FontAwesomeIcon icon={faBookmark} />}
                title="Bookmark this page"
                subtitle="Save it to view later"
                clickFunction={this.bookmarkPage}
              />
            )}

            {bookmarked && (
              <BlockButton
                icon={<FontAwesomeIcon icon={faBookmarkSolid} />}
                title="Bookmarked"
                subtitle="Click here to remove"
                clickFunction={this.unBookmarkPage}
              />
            )}

            <div
              css={css`
                margin-top: 20px;
              `}
            >
              <TextBlock articleContent={true}>
                <div className="Article-sub-title-Style">
                  {post && post.frontmatter.description}
                </div>
                <div
                  data-testid="article-content"
                  className="article-content"
                  dangerouslySetInnerHTML={{
                    __html: htmlSanitize(articleContent)
                  }}
                />
              </TextBlock>
            </div>

            <Section>
              <div
                className="Section-heading-Style"
                css={css`
                  display: flex;
                  ${spacing.standard_vertical}
                  ${spacing.in_page_element}
                `}
              >
                HOW WOULD YOU RATE THIS CONTENT?
              </div>
              <div
                css={css`
                  display: flex;
                `}
                data-id="feedback-buttons"
              >
                <LargeButton
                  additionalCss={css`
                    flex: 1;
                    margin-right: 5px;
                  `}
                  icon={<FontAwesomeIcon icon={faThumbsUp} />}
                  title="Useful"
                  clickFunction={this.givePositiveFeedback}
                  shortMode={true}
                  selected={this.state.feedbackGiven === "positive"}
                  dimmed={this.state.feedbackGiven === "negative"}
                />
                <LargeButton
                  additionalCss={css`
                    flex: 1;
                    margin-left: 5px;
                  `}
                  icon={<FontAwesomeIcon icon={faThumbsDown} />}
                  title="Not useful"
                  clickFunction={this.openNegativeFeedbackScreen}
                  shortMode={true}
                  selected={this.state.feedbackGiven === "negative"}
                  dimmed={this.state.feedbackGiven === "positive"}
                />
              </div>
            </Section>
          </div>
          {peerEdges.length > 0 && (
            <div>
              <Section>
                <TabList title="ALSO IN THIS TOPIC" elements={paginatedPeerEdges} />
                <PaginationBar
                  total={peerEdges.length}
                  paginator={this.state.paginator}
                  clickFunction={this.updatePagination}
                  onPageCount={paginatedPeerEdges.length}
                />
              </Section>
            </div>
          )}
        </Layout>
        {this.webchatEnabled && <WebChat />}
        <Notification
          icon={<FontAwesomeIcon icon={faCheck} />}
          text={this.state.notificationText}
          hidden={!this.state.notificationShowing}
          notificationId={this.state.notificationId}
        />
        {this.state.feedbackOpen && (
          <FeedbackScreen
            hideFunction={this.closeNegativeFeedbackScreen}
            submitFunction={this.submitNegativeFeedback}
          />
        )}
      </div>
    )
  }
}

export const query = graphql`
  query($title: String!) {
    markdownRemark(frontmatter: { title: { eq: $title } }) {
      html
      ...BaseArticleFields
    }

    allMarkdownRemark(filter: {fields: {collection: {in: ["articles", "directories"]}}}) {
      edges {
        node {
          id
          frontmatter {
            description
            title
          }
          fields {
            collection
          }
        }
      }
    }
  }
`
