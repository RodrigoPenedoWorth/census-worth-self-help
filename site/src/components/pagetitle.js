import React from "react"
import { css } from "@emotion/core"
import { spacing } from "../utils/styles"
import Metadata from "./metadata"
import { getSiteSpecificStyle } from "../utils/contenttransforms"

export default ({ children, icon = null, subtitle = null, pageType }) => {
  const siteSpecificColourClass = getSiteSpecificStyle().siteSpecificColourClass

  return (
    <div
      css={css`
        ${spacing.in_page_element}
      `}
    >
      <Metadata pageType={pageType}>SHF: {children}</Metadata>
      <h1
        css={css`
          margin-bottom: 0px;
          display: flex;
        `}
        className={`Article-Title-Style ${siteSpecificColourClass}`}
        data-testid="search-result-title"
      >
        {icon !== null && (
          <div
            css={css`
              font-size: 19px;
              margin: 5px 20px 0px 2px;
            `}
          >
            {icon}
          </div>
        )}
        {children}
      </h1>
      {subtitle && (
        <div
          css={css`
            padding-top: 5px;
            padding-bottom: 15px;
          `}
          className="Button-subhead-Style"
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}
