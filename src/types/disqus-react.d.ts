declare module 'disqus-react' {
  import * as React from 'react';

  export interface DisqusConfig {
    url?: string;
    identifier?: string;
    title?: string;
    language?: string;
    remoteAuthS3?: string;
    apiKey?: string;
    sso?: {
      name?: string;
      button?: string;
      icon?: string;
      url?: string;
      logout?: string;
      profile_url?: string;
      width?: string;
      height?: string;
    };
    [key: string]: any;
  }

  export interface DiscussionEmbedProps {
    shortname: string;
    config: DisqusConfig;
  }

  export class DiscussionEmbed extends React.Component<DiscussionEmbedProps> {}

  export interface CommentCountProps {
    shortname: string;
    config: DisqusConfig;
    children?: React.ReactNode;
  }

  export class CommentCount extends React.Component<CommentCountProps> {}

  export interface CommentEmbedProps {
    commentId: string;
    showMedia?: boolean;
    showParentComment?: boolean;
    width?: number;
    height?: number;
  }

  export class CommentEmbed extends React.Component<CommentEmbedProps> {}
}
