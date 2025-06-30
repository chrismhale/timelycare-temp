// @ts-nocheck

export default $config({
  // Basic app config
  app() {
    return {
      name: "properview",
      home: "aws",
      region: "us-east-1",
    };
  },

  // Resources
  async run() {
    // DynamoDB tables
    const propertiesTable = new sst.aws.Dynamo("Properties", {
      fields: {
        id: "string",
      },
      primaryIndex: { hashKey: "id" },
    });

    const inquiriesTable = new sst.aws.Dynamo("Inquiries", {
      fields: {
        id: "string",
      },
      primaryIndex: { hashKey: "id" },
    });

    // API Gateway
    const api = new sst.aws.ApiGatewayV2("Api", { cors: true });

    // Property routes
    api.route("GET /properties", {
      handler: "backend/functions/getProperties/index.handler",
      link: [propertiesTable],
      environment: { TABLE_NAME: propertiesTable.name },
    });
    api.route("POST /properties", {
      handler: "backend/functions/createProperty/index.handler",
      link: [propertiesTable],
      environment: { TABLE_NAME: propertiesTable.name },
    });
    api.route("PUT /properties/{id}", {
      handler: "backend/functions/updateProperty/index.handler",
      link: [propertiesTable],
      environment: { TABLE_NAME: propertiesTable.name },
    });
    api.route("DELETE /properties/{id}", {
      handler: "backend/functions/deleteProperty/index.handler",
      link: [propertiesTable],
      environment: { TABLE_NAME: propertiesTable.name },
    });
    api.route("GET /agent/properties", {
      handler: "backend/functions/getAgentProperties/index.handler",
      link: [propertiesTable],
      environment: { TABLE_NAME: propertiesTable.name },
    });

    // Inquiry routes
    api.route("POST /inquiries", {
      handler: "backend/functions/submitInquiry/index.handler",
      link: [inquiriesTable],
      environment: { TABLE_NAME: inquiriesTable.name },
    });
    api.route("GET /inquiries", {
      handler: "backend/functions/listInquiries/index.handler",
      link: [inquiriesTable],
      environment: { TABLE_NAME: inquiriesTable.name },
    });

    // Next.js site
    const site = new sst.aws.Nextjs("Web", {
      path: "web",
      link: [api],
      environment: { NEXT_PUBLIC_API_URL: api.url },
    });

    // Outputs
    return {
      SiteUrl: site.url,
      ApiUrl: api.url,
      PropertiesTable: propertiesTable.name,
      InquiriesTable: inquiriesTable.name,
    } as const;
  },
}); 