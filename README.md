# Introduction

This is a reenvisionioned and revamped implementation of the VINwiki.com web application
built with a cohesive user experience in mind.

Top Features:

- Modernized post feed with Trending Posts
- Individual post page with comments (Similar to Reddit)
- Profile pages with comprehensive information on Activity, Vehicles, Lists, etc
- Integrated Vehicle, List, & Person search functionality

> **Note**: This application uses the native rest.vinwiki.com API,
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
Please read the disclaimer on information accuracy. This documentation was derived
from unofficial means and is not affiliated with or approved by VINwiki.com
in any way.

Please Note: The Schema definitions for API types were translated from TypeScript
to OpenAPI spec using GitHub Copilot and may not be 100% accurate.

# Dependencies

- React.js 18
- TypeScript
- MaterialUI
