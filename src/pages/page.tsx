import React from "react"
import Page from "../components/base/page"

type Props = {
  data: {
    page: any
    [key: string]: any
  }
  [key: string]: any
}

export default function MinimalBlogCorePage({ ...props }: Props) {
  return <Page {...props} />
}
