import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { Code } from './src/components/code/code'
import { preToCodeBlock } from 'mdx-utils'

// components is its own object outside of render so that the references to
// components are stable
const components = {
  pre: preProps => {
    const props = preToCodeBlock(preProps)
    // if there's a codeString and some props, we passed the test
    if (props) {
      return <Code {...props} />
    } else {
      // it's possible to have a pre without a code in it
      return <pre {...preProps} />
    }
  },

  ExternalLink: ({children, ...props}) => {
    return (<a {...props} target="_blank">{children}</a>
    );
  },
}
export const wrapRootElement = ({ element }) => (
  <MDXProvider components={components}>{element}</MDXProvider>
)
