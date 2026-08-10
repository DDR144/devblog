# Post Views Specification

## Purpose

Defines server-side view increment behavior compatible with static generation, ensuring views update without breaking SSG output.

## Requirements

### Requirement: Server-Side View Increment

The system MUST increment the view count for a post via a server-side mechanism (Route Handler or Server Action). The increment MUST NOT depend on client-side JavaScript execution.

#### Scenario: View increments on page visit

- GIVEN a post at `/posts/[slug]` has 0 views
- WHEN a user visits the post detail page
- THEN the view count increments by 1 in the database
- AND the increment occurs server-side before or during render

#### Scenario: View increment does not break static output

- GIVEN the post detail page is pre-rendered as static (SSG)
- WHEN the page is served to a visitor
- THEN the page renders with valid static HTML
- AND the view count update happens asynchronously or via a server-side trigger

### Requirement: View Count Display

The system MUST display the current view count on the post detail page.

#### Scenario: View count shown on post detail

- GIVEN a post has been viewed N times
- WHEN a user loads `/posts/[slug]`
- THEN the view count is displayed in the post metadata area
- AND the count reflects the latest value from the database

### Requirement: No Client-Side View Tracking

The system MUST NOT use client-side JavaScript, tracking pixels, or beacon APIs to increment views.

#### Scenario: No client-side tracking scripts

- GIVEN a post detail page is rendered
- WHEN the page source is inspected
- THEN no client-side view tracking scripts or fetch calls to a view endpoint are present
- AND the view increment is handled entirely server-side
