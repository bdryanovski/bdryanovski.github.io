import { graphql } from "gatsby"
import TagsComponent from "../pages/tags"

export default TagsComponent

export const query = graphql`
  query {
    allPost(sort: { fields: tags___name, order: DESC }) {
      group(field: tags___name) {
        fieldValue
        totalCount
      }
    }
  }
`
