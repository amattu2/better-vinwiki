# Introduction

[![Coverage Status](https://coveralls.io/repos/github/amattu2/better-vinwiki/badge.svg?branch=master)](https://coveralls.io/github/amattu2/better-vinwiki?branch=master)

This is a reenvisionioned and revamped implementation of the VINwiki.com web application
built with a cohesive user experience in mind.

Top Features:

- Dark Mode
- Modernized post feed with integrated comments
- Profile pages with comprehensive information on Activity, Vehicles, Lists, etc
- Vehicle diagnostic scan histories, VIN decoding, and recall information
- Enhanced bio and post content w/support for OBD-ii Codes, `@mentions`, `#VIN`,
and more
- Powerful list managment with bulk importing and exporting

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
|`PUBLIC_URL`|The base URL for the application. **Optional** unless deploying under a subdirectory.|
|`REACT_APP_NAME`|The name of the app. Used everywhere|
|`REACT_APP_URL`|The base URL for the application deployment location. **Required** for HTML5 meta tags|
|`REACT_APP_DESCRIPTION`|The description built into the HTML5 meta tags|
|`REACT_APP_SLOGAN`|Sits under the App Name on the auth pages|
|`REACT_APP_API_URL`|Base URL for the VINwiki API. Should have a trailing `/` at the end|
|`REACT_APP_MEDIA_API_URL`|Base URL for the VINwiki Media API. Should have a trailing `/`|
|`REACT_APP_MEDIA_CDN_URL`|Base URL for the VINwiki Media CDN. Should have a trailing `/`|
|`REACT_APP_API_CLIENT`|The client name injected into a new post. Keep it simple and short|

See [src/config/AppConfig.ts](./src/config/AppConfig.ts) for the build defaults.
You likely will not want to leave them as the defaults.

> **Warning**: When using `PUBLIC_URL` for subdirectory deployments, but some functionality may not work
> as expected. This is the BASENAME of the url (e.g. `/subdirectory`)

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
