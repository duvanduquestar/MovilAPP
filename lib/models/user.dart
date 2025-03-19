class User {
  final String id;
  final String nombre;
  final String correo;
  final String password;
  final String rol;

  User({
    required this.id,
    required this.nombre,
    required this.correo,
    required this.password,
    required this.rol,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      nombre: json['nombre'] ?? '',
      correo: json['correo'] ?? '',
      password: json['password'] ?? '',
      rol: json['rol'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'nombre': nombre,
      'correo': correo,
      'password': password,
      'rol': rol,
    };
  }
}