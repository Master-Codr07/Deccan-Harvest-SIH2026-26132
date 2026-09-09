import 'package:flutter/material.dart';
import 'register_screen.dart';
import '../farmer/farmer_dashboard.dart';
import '../buyer/buyer_dashboard.dart';
import '../apmc/apmc_dashboard.dart';
class LoginScreen extends StatefulWidget {
  final String role;

  const LoginScreen({
    super.key,
    required this.role,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool hidePassword = true;
  bool rememberMe = false;

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        title: Text("${widget.role} Login"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 20),

            CircleAvatar(
              radius: 45,
              backgroundColor: Colors.green.shade100,
              child: const Icon(
                Icons.agriculture,
                size: 50,
                color: Colors.green,
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              "Welcome to KrishiSetu",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              "Login as ${widget.role}",
              style: TextStyle(
                color: Colors.grey.shade700,
                fontSize: 16,
              ),
            ),

            const SizedBox(height: 35),

            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: "Email / Mobile",
                prefixIcon: const Icon(Icons.person),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),

            const SizedBox(height: 20),

            TextField(
              controller: passwordController,
              obscureText: hidePassword,
              decoration: InputDecoration(
                labelText: "Password",
                prefixIcon: const Icon(Icons.lock),
                suffixIcon: IconButton(
                  icon: Icon(
                    hidePassword
                        ? Icons.visibility_off
                        : Icons.visibility,
                  ),
                  onPressed: () {
                    setState(() {
                      hidePassword = !hidePassword;
                    });
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Checkbox(
                  value: rememberMe,
                  activeColor: Colors.green,
                  onChanged: (value) {
                    setState(() {
                      rememberMe = value!;
                    });
                  },
                ),
                const Text("Remember Me"),
                const Spacer(),
                TextButton(
                  onPressed: () {},
                  child: const Text("Forgot Password?"),
                ),
              ],
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: () {

  if (widget.role == "Farmer") {

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => const FarmerDashboard(),
      ),
    );

  } else if (widget.role == "Buyer") {

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => const BuyerDashboard(),
      ),
    );

  } else if (widget.role == "APMC Officer") {

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => const ApmcDashboard(),
      ),
    );

  } else {

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("${widget.role} Dashboard Coming Soon"),
      ),
    );

  }
},
                child: const Text(
                  "LOGIN",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 18),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Don't have an account?"),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RegisterScreen(
                          role: widget.role,
                        ),
                      ),
                    );
                  },
                  child: const Text("Register"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}