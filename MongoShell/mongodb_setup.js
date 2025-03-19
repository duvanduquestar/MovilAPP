// Script para configurar MongoDB para el Reto 1: "¡Despegue con MongoDB!"

// Importamos el módulo de MongoDB
const { MongoClient } = require('mongodb');

// URL de conexión a MongoDB
const url = 'mongodb://localhost:27017';

// Nombre de la base de datos
const dbName = 'fullstack_game';

// Crear un nuevo cliente de MongoDB
const client = new MongoClient(url);

async function main() {
  try {
    // Conectar al servidor de MongoDB
    await client.connect();
    console.log('Conectado correctamente al servidor de MongoDB');

    // Obtener referencia a la base de datos
    const db = client.db(dbName);
    console.log(`Base de datos '${dbName}' creada o seleccionada correctamente`);

    // Crear colección 'usuarios'
    const usuariosCollection = db.collection('usuarios');
    console.log("Colección 'usuarios' creada o seleccionada correctamente");

    // Eliminar documentos existentes (para evitar duplicados en ejecuciones repetidas)
    await usuariosCollection.deleteMany({});
    console.log("Documentos existentes eliminados");

    // Insertar al menos 3 documentos en la colección
    const result = await usuariosCollection.insertMany([
      {
        nombre: "Admin Principal",
        correo: "admin@fullstack.com",
        password: "admin123",
        rol: "admin"
      },
      {
        nombre: "Usuario Regular",
        correo: "usuario@fullstack.com",
        password: "user123",
        rol: "usuario"
      },
      {
        nombre: "Administrador Secundario",
        correo: "admin2@fullstack.com",
        password: "admin456",
        rol: "admin"
      }
    ]);

    console.log(`${result.insertedCount} documentos insertados correctamente`);

    // Realizar consulta para filtrar por rol (puntos extra)
    console.log("\nConsulta para filtrar por rol 'admin':");
    const adminUsers = await usuariosCollection.find({ rol: "admin" }).toArray();
    console.log(adminUsers);

    console.log("\nConsulta para filtrar por rol 'usuario':");
    const regularUsers = await usuariosCollection.find({ rol: "usuario" }).toArray();
    console.log(regularUsers);

    console.log("\n¡RETO 1 COMPLETADO CON ÉXITO!");

  } catch (err) {
    console.error('Error durante la ejecución:', err);
  } finally {
    // Cerrar la conexión
    await client.close();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la función principal
main().catch(console.error);