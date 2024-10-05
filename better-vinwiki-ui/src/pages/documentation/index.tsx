import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * A OpenAPI/Swagger documentation page.
 *
 * @returns {JSX.Element}
 */
const Documentation = () => <SwaggerUI url="/openapi.yml" docExpansion="list" />;

export default Documentation;
