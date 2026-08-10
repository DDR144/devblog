# Blog Rendering Specification

## Purpose

Defines Server/Client Component architecture, SSG/ISR rendering strategy per route, and segment-level loading/error/not-found boundaries for the Next.js 14 App Router migration.

## Requirements

### Requirement: Server/Client Component Split

The system MUST render public pages as Server Components by default. Client Components SHALL be used ONLY where client-side interactivity is required (form inputs, toggle state, browser APIs).

#### Scenario: Public page renders as Server Component

- GIVEN the home page or a post detail page is requested
- WHEN the page is rendered
- THEN the component tree contains NO `'use client'` directives at the page level
- AND the HTML is fully formed before reaching the client (no empty shell hydration)

#### Scenario: Interactive element isolates to Client Component

- GIVEN a page contains an interactive element (e.g., dark mode toggle, search input, admin form)
- WHEN the page is rendered
- THEN the interactive element is wrapped in a dedicated Client Component file
- AND the parent page remains a Server Component

### Requirement: SSG+ISR Rendering Per Route

The system MUST pre-render public routes at build time (SSG) and revalidate on a time-based interval (ISR). Static params MUST be generated for all seeded content.

#### Scenario: Home page pre-renders with ISR revalidation

- GIVEN the home page lists posts
- WHEN `npm run build` executes
- THEN the home page output type is Static (Σ or ○)
- AND the page specifies a `revalidate` interval

#### Scenario: Post detail pre-renders for all slugs

- GIVEN 5 seeded posts exist in the database
- WHEN `npm run build` executes
- THEN `generateStaticParams` returns all 5 slugs
- AND each post page output type is Static
- AND each page specifies a `revalidate` interval

#### Scenario: Category and author pages pre-render

- GIVEN seeded categories and authors exist
- WHEN `npm run build` executes
- THEN all category pages (`/category/[slug]`) and author pages (`/authors/[id]`) output as Static

### Requirement: Segment Loading and Error Boundaries

The system MUST provide `loading.tsx`, `error.tsx`, and `not-found.tsx` files for route segments that benefit from them.

#### Scenario: Loading state shown during data fetch

- GIVEN a user navigates to a route with an async data dependency
- WHEN the data is being fetched
- THEN a `loading.tsx` UI is displayed before the page content arrives

#### Scenario: Error boundary catches render failure

- GIVEN a page's server-side data fetch throws an error
- WHEN the error occurs during render
- THEN an `error.tsx` boundary catches it
- AND the error UI includes a recovery action (e.g., retry link)

#### Scenario: Not-found for invalid slugs

- GIVEN a user navigates to `/posts/nonexistent-slug`
- WHEN the slug does not match any seeded post
- THEN `not-found.tsx` is rendered with a 404 status

### Requirement: Admin Routes Use Client Components Where Needed

Admin pages SHALL use `'use client'` directives ONLY on components requiring interactivity (forms, textareas, preview toggles). Page shells and layouts remain Server Components.

#### Scenario: Admin list page renders server-side

- GIVEN an admin navigates to `/admin`
- WHEN the post list is rendered
- THEN the list component is a Server Component fetching data server-side

#### Scenario: Admin editor isolates interactivity

- GIVEN an admin navigates to `/admin/new` or `/admin/edit/[id]`
- WHEN the editor form is rendered
- THEN the form component is a Client Component
- AND the page layout remains a Server Component
