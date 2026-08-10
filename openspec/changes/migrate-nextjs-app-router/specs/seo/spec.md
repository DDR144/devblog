# SEO Specification

## Purpose

Defines dynamic metadata generation, structured data (JSON-LD), sitemap/robots files, image optimization, and canonical URLs for the migrated blog.

## Requirements

### Requirement: Dynamic generateMetadata Per Page Type

The system MUST export `generateMetadata` functions for post detail (Article), author profile (ProfilePage), and collection pages (category/tag listing — CollectionPage schema).

#### Scenario: Post detail metadata

- GIVEN a post at `/posts/[slug]` with title, excerpt, author, and cover image
- WHEN the page is rendered or pre-rendered
- THEN `generateMetadata` returns title, description (from excerpt), openGraph tags (title, description, image, type=article), and Twitter card tags

#### Scenario: Author profile metadata

- GIVEN an author at `/authors/[id]` with name and bio
- WHEN the page is rendered
- THEN `generateMetadata` returns title (author name), description (bio), and openGraph tags

#### Scenario: Category/tag collection metadata

- GIVEN a category page at `/category/[slug]` with a name
- WHEN the page is rendered
- THEN `generateMetadata` returns title containing the category name and description

### Requirement: JSON-LD Structured Data

The system MUST include JSON-LD structured data on public pages using the appropriate schema.org type.

#### Scenario: Article schema on post detail

- GIVEN a post detail page is rendered
- WHEN the page HTML is inspected
- THEN a `<script type="application/ld+json">` block contains Article schema with headline, author, datePublished, dateModified, image, and url

#### Scenario: Person schema on author page

- GIVEN an author profile page is rendered
- WHEN the page HTML is inspected
- THEN a JSON-LD block contains Person schema with name and url

### Requirement: Sitemap and Robots

The system MUST generate `sitemap.ts` and `robots.ts` at the project root of the `app/` directory.

#### Scenario: Sitemap includes all public routes

- GIVEN the application has seeded content
- WHEN `/sitemap.xml` is requested
- THEN the sitemap includes the home page, all post URLs, all author URLs, all category URLs, and all tag URLs
- AND each entry has a lastmod date

#### Scenario: Robots.txt allows crawling

- GIVEN `/robots.txt` is requested
- THEN the response allows all crawlers and references the sitemap URL

### Requirement: Canonical URLs

The system MUST define canonical URLs for post detail, author profile, and category/tag pages.

#### Scenario: Canonical URL on post page

- GIVEN a post at `/posts/my-post`
- WHEN the page is rendered
- THEN a `<link rel="canonical">` tag points to the full URL of `/posts/my-post`

### Requirement: Image Optimization with next/image

The system MUST use `next/image` for cover images and author avatars where applicable.

#### Scenario: Cover image uses next/image

- GIVEN a post has a `cover_image` URL
- WHEN the post card or detail page renders the cover
- THEN `next/image` `<Image>` component is used with `src`, `alt`, and appropriate `width`/`height` or `fill` props
