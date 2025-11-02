import express from 'express';
import cors from 'cors';
import usuarioRoutes from './routes/usuarios_routes.js';
import authRoutes from './routes/auth_routes.js';
import solicitudRoutes from './routes/solicitud_routes.js';
import ofertasRoutes from './routes/ofertas_routes.js';
import negociacionesRoutes from './routes/negociaciones_routes.js';
import negociacionesTransportistaRoutes from "./routes/negociaciones_transportista_routes.js";
import negociacionesClienteRoutes from "./routes/negociaciones_clientes_routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/negociaciones', negociacionesRoutes);
app.use("/api/negociaciones-transportista", negociacionesTransportistaRoutes);
app.use("/api/negociaciones-cliente", negociacionesClienteRoutes);

// 🔍 Log para confirmar las rutas activas
app.use((req, res, next) => {
  console.log(`📡 Petición recibida: ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => res.send('✅ Servidor activo'));

console.log("🔗 Rutas cargadas: /api/usuarios, /api/auth, /api/solicitudes, /api/ofertas");

export default app;
