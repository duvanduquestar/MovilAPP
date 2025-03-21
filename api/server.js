
// Servidor Express para el Reto 2: "API REST con Express"

// Importamos los módulos necesarios
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');

// Configuración de la conexión a MongoDB
const url = 'mongodb+srv://duvi:xd4Vm.qETTHjQjW@cluster0.iec2c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
//const url = 'mongodb://localhost:27017';
const dbName = 'fullstack_game';
const client = new MongoClient(url);
//xd4Vm.qETTHjQjW
// Configuración de JWT
const JWT_SECRET = 'secreto_del_reto4_fulñlstack';
const JWT_EXPIRES_IN = '24h';

// Crear la aplicación Express
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  // Obtener el token del header de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado' });
  }
  
  try {
    // Verificar el token
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Conectar a MongoDB antes de iniciar el servidor
async function connectToMongo() {
  try {
    await client.connect();
    console.log('Conectado correctamente al servidor de MongoDB');
    return client.db(dbName);
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
}

// Rutas de la API
app.get('/', (req, res) => {
  res.json({ mensaje: 'API REST del Reto 2 - La Carrera Full-Stack' });
});

// Ruta para login de usuarios
app.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    if (!correo || !password) {
      return res.status(400).json({ error: 'Por favor, proporcione correo y contraseña' });
    }
    
    const db = client.db(dbName);
    const usuario = await db.collection('usuarios').findOne({ correo });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // En un entorno real, las contraseñas deberían estar hasheadas
    // Aquí comparamos directamente para simplificar
    if (usuario.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Crear y firmar el token JWT
    const token = jwt.sign(
      { id: usuario._id, correo: usuario.correo, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para obtener todos los usuarios (protegida)
app.get('/usuarios', verificarToken, async (req, res) => {
  try {
    const db = client.db(dbName);
    const usuarios = await db.collection('usuarios').find({}).toArray();
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta para obtener un usuario por su ID (protegida)
app.get('/usuarios/:id', verificarToken, async (req, res) => {
  try {
    const db = client.db(dbName);
    const userId = req.params.id;
    
    // Importar ObjectId de MongoDB
    const { ObjectId } = require('mongodb');
    
    // Intentar convertir el ID a ObjectId si es posible
    let query = { _id: userId };
    try {
      if (ObjectId.isValid(userId)) {
        query = { _id: new ObjectId(userId) };
      }
    } catch (error) {
      // Si hay error en la conversión, mantener el ID como string
      console.log('Usando ID como string:', userId);
    }
    
    const usuario = await db.collection('usuarios').findOne(query);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Ruta para crear un nuevo usuario (protegida para administradores)
app.post('/usuarios', verificarToken, async (req, res) => {
  // Verificar si el usuario es administrador
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  
  try {
    const db = client.db(dbName);
    const nuevoUsuario = req.body;
    const result = await db.collection('usuarios').insertOne(nuevoUsuario);
    res.status(201).json({ 
      mensaje: 'Usuario creado correctamente',
      usuario: { ...nuevoUsuario, _id: result.insertedId }
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Ruta para filtrar usuarios por rol (protegida)
app.get('/usuarios/rol/:rol', verificarToken, async (req, res) => {
  try {
    const db = client.db(dbName);
    const rol = req.params.rol;
    const usuarios = await db.collection('usuarios').find({ rol: rol }).toArray();
    res.json(usuarios);
  } catch (err) {
    console.error('Error al filtrar usuarios por rol:', err);
    res.status(500).json({ error: 'Error al filtrar usuarios por rol' });
  }
});

// Ruta para verificar el token actual
app.get('/verificar-token', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Token válido',
    usuario: req.user
  });
});

// Ruta para actualizar un usuario existente (protegida para administradores)
app.put('/usuarios/:id', verificarToken, async (req, res) => {
  // Verificar si el usuario es administrador
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  
  try {
    const db = client.db(dbName);
    const userId = req.params.id;
    const datosActualizados = req.body;
    
    // Eliminar el campo _id si existe en los datos actualizados
    delete datosActualizados._id;
    
    // Importar ObjectId de MongoDB
    const { ObjectId } = require('mongodb');
    
    // Intentar convertir el ID a ObjectId si es posible
    let query = { _id: userId };
    try {
      if (ObjectId.isValid(userId)) {
        query = { _id: new ObjectId(userId) };
      }
    } catch (error) {
      // Si hay error en la conversión, mantener el ID como string
      console.log('Usando ID como string:', userId);
    }
    
    const result = await db.collection('usuarios').updateOne(
      query,
      { $set: datosActualizados }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const usuarioActualizado = await db.collection('usuarios').findOne(query);
    
    res.json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: usuarioActualizado
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Ruta para eliminar un usuario (protegida para administradores)
app.delete('/usuarios/:id', verificarToken, async (req, res) => {
  // Verificar si el usuario es administrador
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  
  try {
    const db = client.db(dbName);
    const userId = req.params.id;
    
    // Importar ObjectId de MongoDB
    const { ObjectId } = require('mongodb');
    
    // Intentar convertir el ID a ObjectId si es posible
    let query = { _id: userId };
    try {
      if (ObjectId.isValid(userId)) {
        query = { _id: new ObjectId(userId) };
      }
    } catch (error) {
      // Si hay error en la conversión, mantener el ID como string
      console.log('Usando ID como string:', userId);
    }
    
    const result = await db.collection('usuarios').deleteOne(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      mensaje: 'Usuario eliminado correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Iniciar el servidor
async function startServer() {
  const db = await connectToMongo();
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });

}

startServer().catch(console.error);