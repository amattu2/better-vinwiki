# Introduction

This is a reenvisionioned and revamped implementation of the VINwiki.com web application
built with a cohesive user experience in mind.

Top Features:

- Modernized post feed with Trending Posts
- Individual post page with comments (Similar to Reddit)
- Profile pages with comprehensive information on Activity, Vehicles, Lists, etc
- Vehicle diagnostic scan histories, VIN decoding, recall information, and more
- Enhanced bio and post content w/support for OBD-ii Codes, `@mentions`, `#VIN`,
and more

> **Note**: This application uses the native vinwiki.com API,
> but is not affiliated with VINwiki.com in any way.

# Usage

Clone the application locally

```bash
git clone https://github.com/amattu2/better-vinwiki.git
```

Install dependencies

```bash
cd better-vinwiki && npm ci
```

Setup the `.env` file

```bash
cp .env.example .env
```

Run the application

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

# Advanced Configuration

The default build will start out of the box, but needs to be tied to the correct
VINwiki deployment tier (e.g. DEV/PROD). These should be injected during the build
process.

Configuration Options (See [.env.example](./.env.example) for all options):

| Name | Description |
|:-|:-|
|`PUBLIC_URL`|The base URL for the application. Optional but useful for deployment under a subdirectory.|
|`REACT_APP_NAME`|The name of the app. Used everywhere|
|`REACT_APP_DESCRIPTION`|The description built into the HTML5 meta tags|
|`REACT_APP_SLOGAN`|Sits under the App Name on the auth pages|
|`REACT_APP_API_URL`|Base URL for the VINwiki API. Should have a trailing `/` at the end|
|`REACT_APP_MEDIA_API_URL`|Base URL for the VINwiki Media API. Should have a trailing `/`|
|`REACT_APP_MEDIA_CDN_URL`|Base URL for the VINwiki Media CDN. Should have a trailing `/`|
|`REACT_APP_API_CLIENT`|The client name injected into a new post. Keep it simple and short|

See [src/config/AppConfig.ts](./src/config/AppConfig.ts) for the build defaults.
You likely will not want to leave them as the defaults.

> **Warning**: When using `PUBLIC_URL` for subdirectory deployments, some functionality may not work
> as expected. This app does not officially support subdirectory deployments. If you aren't deploying
> on a subdirectory, don't define this option.

# VINwiki REST API Docs

The OpenAPI Documentation for the VINwiki REST API can be found [here](./openapi.yml).
This documentation was derived from unofficial means and is not affiliated with
or approved by VINwiki.com in any way.

The documentation is imported at build time using the Swagger React UI and can
be viewed by navigating to the `/documentation` route.

> **Note**: The Schema definitions for API types were translated from TypeScript
> to OpenAPI spec and may not be 100% accurate, please refer to the [src/types](./src/types)
> for most accurate definitions.

# Dependencies

- React.js 18
- TypeScript
- MaterialUI
