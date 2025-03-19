# Reto 2: API REST con Express y MongoDB

Este proyecto implementa una API REST utilizando Express.js que se conecta a MongoDB para el Reto 2 de "La Carrera Full-Stack".

## Requisitos previos

- Node.js instalado
- MongoDB ejecutándose en localhost:27017
- Base de datos `fullstack_game` creada (desde el Reto 1)

## Instalación

1. Navega al directorio del proyecto:
   ```
   cd reto-2
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

## Ejecución

Para iniciar el servidor:
```
npm start
```

Para desarrollo (con recarga automática):
```
npm run dev
```

El servidor se ejecutará en http://localhost:3000

## Endpoints disponibles

- `GET /`: Mensaje de bienvenida
- `GET /usuarios`: Obtiene todos los usuarios
- `GET /usuarios/:id`: Obtiene un usuario por su ID
- `POST /usuarios`: Crea un nuevo usuario
- `GET /usuarios/rol/:rol`: Filtra usuarios por rol

## Ejemplo de uso

### Obtener todos los usuarios
```
GET http://localhost:3000/usuarios
```

### Crear un nuevo usuario
```
POST http://localhost:3000/usuarios
Content-Type: application/json

{
  "nombre": "Nuevo Usuario",
  "correo": "nuevo@fullstack.com",
  "password": "clave123",
  "rol": "usuario"
}
```

### Filtrar usuarios por rol
```
GET http://localhost:3000/usuarios/rol/admin
```