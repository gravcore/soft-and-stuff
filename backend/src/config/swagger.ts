import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Soft And Stuff API',
            version: '1.0.0',
            description: 'E-commerce backend'
        },
        servers: [{ url: '/api/v1', description: 'Version 1'}],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
        },        
    },
    apis: ['./src/modules/**/versions/**/*.routes.*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options as swaggerJsdoc.Options);