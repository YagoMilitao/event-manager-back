const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Manager API",
      version: "1.0.0",
      description: "API para gerenciar eventos",
    },
    servers: [
      {
        url: "http://localhost:5000", // Troque com a URL do seu app
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Caminho para os arquivos de rotas
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
