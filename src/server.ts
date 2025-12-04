import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import sequelize, { testConnection, syncDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bemRoutes from './routes/bem.routes';
import movimentacaoRoutes from './routes/movimentacao.routes';
import {
  perfilRoutes,
  categoriaRoutes,
  localizacaoRoutes,
  tipoMovimentacaoRoutes,
} from './routes/reference.routes';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Fastify instance
const fastify = Fastify({
  logger: NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  } : true,
});

// Register CORS
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(bemRoutes, { prefix: '/api/bens' });
fastify.register(movimentacaoRoutes, { prefix: '/api/movimentacoes' });

// Reference table routes
fastify.register(perfilRoutes, { prefix: '/api/perfis' });
fastify.register(categoriaRoutes, { prefix: '/api/categorias' });
fastify.register(localizacaoRoutes, { prefix: '/api/localizacoes' });
fastify.register(tipoMovimentacaoRoutes, { prefix: '/api/tipos-movimentacao' });

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
    },
  });
});

// Error handler
fastify.setErrorHandler(errorHandler);

// Start server
const start = async () => {
  try {
    console.log('\n🚀 Iniciando Sistema de Patrimônio API...\n');

    // Test database connection
    console.log('📊 Conectando ao banco de dados...');
    await testConnection();

    // Sync database (only in development)
    if (NODE_ENV === 'development') {
      console.log('🔄 Sincronizando modelos com o banco de dados...');
      await syncDatabase(false);
    }

    // Start Fastify server
    await fastify.listen({ port: PORT, host: HOST });

    console.log(`\n✅ Servidor rodando em: http://${HOST}:${PORT}`);
    console.log(`📝 Ambiente: ${NODE_ENV}`);
    console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('\n📚 Rotas disponíveis:');
    console.log('   • POST   /api/auth/login');
    console.log('   • POST   /api/auth/logout');
    console.log('   • POST   /api/auth/recover-password');
    console.log('   • PUT    /api/auth/change-password');
    console.log('   • GET    /api/auth/me');
    console.log('   • GET    /api/users');
    console.log('   • POST   /api/users');
    console.log('   • GET    /api/bens');
    console.log('   • POST   /api/bens');
    console.log('   • GET    /api/movimentacoes');
    console.log('   • POST   /api/movimentacoes');
    console.log('   • GET    /api/categorias');
    console.log('   • GET    /api/localizacoes');
    console.log('   • GET    /api/perfis');
    console.log('   • GET    /api/tipos-movimentacao');
    console.log('\n💡 Dica: Use /health para verificar o status da API\n');
  } catch (err) {
    fastify.log.error(err);
    console.error('\n❌ Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n\n🛑 Encerrando servidor...');

  try {
    await fastify.close();
    await sequelize.close();
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao encerrar servidor:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start the server
start();
