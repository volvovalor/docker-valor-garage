# Development Notes
*Next.js application development using React and Typescript.*


# Technology Stack

- **Next.js (framework):** Routing, pages, server-side rendering, APIs and more
- **React:** Builds your UI from reusable components.
- **TypeScript:** Adds types and helps catch programming mistakes.
- **Web application:** Pages, layouts, components, data and functionality


# Page Rendering

The initial [page.tsx](src/app/page.tsx) is rendered on the server and sent to the client. The page is then hydrated and becomes interactive. This means that the initial HTML is generated on the server, which can improve performance and SEO.

The initial [layout.tsx](src/app/layout.tsx) is also rendered on the server and sent to the client. The layout is then hydrated and becomes interactive. This means that the initial HTML is generated on the server, which can improve performance and SEO. It also holds the Application Shell, which is the basic structure of the application that is shared across all pages. This includes the header, footer, and navigation.

The [AppShell.tsx](src/app/AppShell.tsx) is rendered on the client and is responsible for rendering the main content of the application. It also holds the Application Shell, which is the basic structure of the application that is shared across all pages. This includes the header, footer, and navigation. Currently we check if we are on the home page or not and render the appropriate page component. This is where we can add client-side logic, such as handling user interactions and updating the UI.
