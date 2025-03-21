import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import 'auth_service.dart';

class UserService {
  final String baseUrl = 'https://movilapp.onrender.com';

  Future<List<User>> getUsers() async {
    try {
      final authService = AuthService();
      final token = await authService.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/usuarios'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> usersJson = jsonDecode(response.body);
        return usersJson.map((json) => User.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar usuarios: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<List<User>> getUsersByRole(String role) async {
    try {
      final authService = AuthService();
      final token = await authService.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/usuarios/rol/$role'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> usersJson = jsonDecode(response.body);
        return usersJson.map((json) => User.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar usuarios por rol: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  Future<User> createUser(User user) async {
    try {
      final authService = AuthService();
      final token = await authService.getToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/usuarios'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(user.toJson()..remove('_id')),
      );

      if (response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        return User.fromJson(responseData['usuario']);
      } else {
        throw Exception('Error al crear usuario: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
  
  // Update an existing user
  Future<User> updateUser(User user) async {
    try {
      final authService = AuthService();
      final token = await authService.getToken();
      
      final response = await http.put(
        Uri.parse('$baseUrl/usuarios/${user.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(user.toJson()..remove('_id')),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return User.fromJson(responseData['usuario']);
      } else {
        throw Exception('Error al actualizar usuario: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
  
  // Delete a user by ID
  Future<bool> deleteUser(String userId) async {
    try {
      final authService = AuthService();
      final token = await authService.getToken();
      
      final response = await http.delete(
        Uri.parse('$baseUrl/usuarios/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception('Error al eliminar usuario: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
  
  // Get a single user by ID
  Future<User> getUserById(String userId) async {
    try {
      final authService = AuthService();
      final token = await authService.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/usuarios/$userId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final userJson = jsonDecode(response.body);
        return User.fromJson(userJson);
      } else {
        throw Exception('Error al obtener usuario: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}