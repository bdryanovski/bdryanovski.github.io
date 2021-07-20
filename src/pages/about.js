import React from 'react';
import {graphql} from 'gatsby';

import Layout from '../components/Layout';
import SEO from '../components/seo';

class BlogAbout extends React.Component {
  render() {
    const {data} = this.props;
    const siteTitle = data.site.siteMetadata.title;

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title="All posts"
          keywords={[`blog`, `gatsby`, `javascript`, `react`]}
        />
        <div>
          <h1>About</h1>
        </div>
      </Layout>
    );
  }
}

export default BlogAbout;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
