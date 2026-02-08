const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

function setupSwagger(app) {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Student Tracker API",
                version: "1.0.0",
                description: "API docs for the Student Tracker backend",
            },
        },
        apis: ["./server.js"] //this tells swagger where your comments are
    }

    const swaggerSpec = swaggerJsdoc(options);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;