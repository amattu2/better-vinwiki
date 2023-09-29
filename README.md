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

Run the application

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

# VINwiki REST API Docs

The OpenAPI Documentation for the VINwiki REST API can be found [here](./openapi.yml).
This documentation was derived from unofficial means and is not affiliated with
or approved by VINwiki.com in any way.

To generate the documentation, run the following command:

```bash
npm run docs:make
```

Due to compatibility issues with the OpenAPI Generator, the generated
documentation uses the old `html` template.

> **Note**: The Schema definitions for API types were translated from TypeScript
> to OpenAPI spec and may not be 100% accurate, please refer to the [src/types](./src/types)
> for most accurate definitions.

# Dependencies

- React.js 18
- TypeScript
- MaterialUI
