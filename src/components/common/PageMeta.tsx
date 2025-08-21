// <Helmet> tag - A third-party library designed to manage the document head of a React application.
// It allows developers to dynamically control various HTML tags within the <head> section of the document

import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;

//Meta tags in web development are HTML elements used to provide metadata about a webpage,
//essentially extra information that isn't directly displayed on the page itself.
//This metadata helps search engines, browsers, and other web services understand and
//handle the content of the page, impacting how it's displayed in search results and shared on social media. 