# Blog Admin Specification

## Purpose

Defines the admin panel for CRUD post management, including the editor with markdown preview, Server Actions for mutations, and cache revalidation.

## Requirements

### Requirement: Admin Post List

The system MUST display all posts in a list view at `/admin` with title, status, and action links.

#### Scenario: Admin list shows all posts

- GIVEN 5 seeded posts exist
- WHEN an admin navigates to `/admin`
- THEN all posts are listed with title, publication date, and edit/delete actions

### Requirement: Admin Post Editor

The system MUST provide a textarea-based markdown editor with a live preview toggle for creating (`/admin/new`) and editing (`/admin/edit/[id]`) posts.

#### Scenario: Create new post

- GIVEN an admin navigates to `/admin/new`
- WHEN the form is submitted with title, content (markdown), category selection, tag selection, and optional cover image URL
- THEN a new post is created in the database
- AND the admin is redirected to the post list

#### Scenario: Edit existing post

- GIVEN an admin navigates to `/admin/edit/[id]` with a valid post ID
- WHEN the form loads
- THEN existing post data pre-fills the form fields
- AND editing and re-submitting updates the post

#### Scenario: Preview toggle shows rendered markdown

- GIVEN the editor textarea contains markdown content
- WHEN the admin toggles the preview
- THEN the markdown is rendered as HTML using `react-markdown` (client-side)

#### Scenario: Cover image accepts URL only

- GIVEN the admin is creating or editing a post
- WHEN the cover image field is used
- THEN it accepts a URL string (no file upload)
- AND the URL is stored as `cover_image` on the post record

### Requirement: Admin Category and Tag Selection

The system MUST allow selecting a single category and multiple tags from existing seeded data when creating or editing a post.

#### Scenario: Category selection from existing categories

- GIVEN 5 seeded categories exist
- WHEN the admin creates or edits a post
- THEN all 5 categories are available in a selection control
- AND exactly one category is assigned

#### Scenario: Multi-tag selection from existing tags

- GIVEN 10 seeded tags exist
- WHEN the admin creates or edits a post
- THEN all 10 tags are available in a multi-select control
- AND zero or more tags can be assigned

### Requirement: Server Actions for Post Mutations

All post create/update/delete operations MUST use Next.js Server Actions (not API routes).

#### Scenario: Create action persists to database

- GIVEN the admin submits the create form
- WHEN the Server Action executes
- THEN the post is inserted into the database via Prisma
- AND `revalidateTag('posts')` is called to refresh cached pages

#### Scenario: Delete action removes post

- GIVEN the admin clicks delete on a post in the list
- WHEN the delete Server Action executes
- THEN the post is removed from the database
- AND `revalidateTag('posts')` is called

### Requirement: Admin Remains Unauthenticated

The admin panel MUST remain accessible without authentication (matching current SPA behavior). This is a known technical debt documented for future auth integration.

#### Scenario: Admin accessible without login

- GIVEN no authentication system is configured
- WHEN a user navigates to `/admin`
- THEN the admin list is rendered without any auth redirect or middleware block
