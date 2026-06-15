const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FieldForce Pro API',
      version: '1.0.0',
      description: 'Field Sales Employee Tracking & Workforce Management SaaS Platform API Documentation',
      contact: {
        name: 'FieldForce Pro Team',
        email: 'support@fieldforcepro.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.fieldforcepro.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            first_name: {
              type: 'string'
            },
            last_name: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'company_admin', 'manager', 'employee']
            },
            company_id: {
              type: 'string',
              format: 'uuid'
            },
            is_active: {
              type: 'boolean'
            }
          }
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            business_name: {
              type: 'string'
            },
            subscription_plan: {
              type: 'string',
              enum: ['starter', 'professional', 'enterprise']
            },
            subscription_status: {
              type: 'string',
              enum: ['active', 'trial', 'expired', 'cancelled', 'suspended']
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            title: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            type: {
              type: 'string',
              enum: ['visit', 'meeting', 'survey', 'collection', 'service_request']
            },
            status: {
              type: 'string',
              enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent']
            },
            due_date: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string'
            },
            business_name: {
              type: 'string'
            },
            phone: {
              type: 'string'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            address: {
              type: 'string'
            },
            category: {
              type: 'string'
            }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            employee_id: {
              type: 'string',
              format: 'uuid'
            },
            date: {
              type: 'string',
              format: 'date'
            },
            check_in_time: {
              type: 'string',
              format: 'date-time'
            },
            check_out_time: {
              type: 'string',
              format: 'date-time'
            },
            work_hours: {
              type: 'number'
            },
            status: {
              type: 'string',
              enum: ['present', 'absent', 'late', 'early_exit', 'half_day']
            }
          }
        },
        Visit: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            customer_id: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['sales', 'follow_up', 'complaint', 'collection']
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'missed']
            },
            scheduled_date: {
              type: 'string',
              format: 'date-time'
            },
            duration_minutes: {
              type: 'integer'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            order_number: {
              type: 'string'
            },
            customer_id: {
              type: 'string',
              format: 'uuid'
            },
            status: {
              type: 'string',
              enum: ['draft', 'pending', 'approved', 'delivered', 'cancelled']
            },
            total_amount: {
              type: 'number'
            },
            order_date: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['travel', 'food', 'lodging', 'miscellaneous']
            },
            amount: {
              type: 'number'
            },
            description: {
              type: 'string'
            },
            expense_date: {
              type: 'string',
              format: 'date'
            },
            status: {
              type: 'string',
              enum: ['submitted', 'approved', 'rejected', 'pending']
            }
          }
        },
        Leave: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            type: {
              type: 'string',
              enum: ['casual', 'sick', 'paid', 'unpaid']
            },
            start_date: {
              type: 'string',
              format: 'date'
            },
            end_date: {
              type: 'string',
              format: 'date'
            },
            total_days: {
              type: 'number'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'cancelled']
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            statusCode: {
              type: 'integer'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
