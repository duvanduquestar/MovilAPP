import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  
  
  final String baseUrl = 'https://movilapp.onrender.com';
  
  // Key for storing the JWT token in SharedPreferences
  static const String tokenKey = 'jwt_token';
  static const String userDataKey = 'user_data';
  
  // Login method
  Future<void> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'correo': email,
          'password': password,
        }),
      );
      
      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final token = responseData['token'];
        final userData = responseData['usuario'];
        
        // Store the token and user data
        await _saveToken(token);
        await _saveUserData(userData);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Error en el inicio de sesión');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
  
  // Logout method
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(tokenKey);
    await prefs.remove(userDataKey);
  }
  
  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
  
  // Get the stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(tokenKey);
  }
  
  // Get the stored user data
  Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString(userDataKey);
    if (userDataString != null) {
      return jsonDecode(userDataString) as Map<String, dynamic>;
    }
    return null;
  }
  
  // Save token to SharedPreferences
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(tokenKey, token);
  }
  
  // Save user data to SharedPreferences
  Future<void> _saveUserData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(userDataKey, jsonEncode(userData));
  }
  
  // Verify if the token is valid
  Future<bool> verifyToken() async {
    try {
      final token = await getToken();
      if (token == null) return false;
      
      final response = await http.get(
        Uri.parse('$baseUrl/verificar-token'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}