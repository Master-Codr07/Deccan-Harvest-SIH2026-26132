import 'package:flutter/material.dart';

class RegisterScreen extends StatefulWidget {
  final String role;

  const RegisterScreen({
    super.key,
    required this.role,
  });

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {

  final _formKey = GlobalKey<FormState>();

  final nameController = TextEditingController();
  final mobileController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),

      appBar: AppBar(
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        title: Text("${widget.role} Registration"),
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),

        child: Form(
          key: _formKey,

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,

            children: [

              const SizedBox(height: 10),

              Center(
                child: CircleAvatar(
                  radius: 45,
                  backgroundColor: Colors.green.shade100,
                  child: const Icon(
                    Icons.agriculture,
                    color: Colors.green,
                    size: 50,
                  ),
                ),
              ),

              const SizedBox(height: 20),

              const Center(
                child: Text(
                  "Create Your Account",
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              const SizedBox(height: 30),

              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: "Full Name",
                  prefixIcon: Icon(Icons.person),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 18),

              TextFormField(
                controller: mobileController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: "Mobile Number",
                  prefixIcon: Icon(Icons.phone),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 18),

              TextFormField(
                controller: emailController,
                decoration: const InputDecoration(
                  labelText: "Email",
                  prefixIcon: Icon(Icons.email),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 18),

              TextFormField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: "Password",
                  prefixIcon: Icon(Icons.lock),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 18),

              TextFormField(
                controller: confirmPasswordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: "Confirm Password",
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 25),

              const Text(
                "Additional Information",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 15),

              ...buildRoleFields(),

              const SizedBox(height: 30),

              SizedBox(
                width: double.infinity,
                height: 55,

                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),

                  onPressed: () {

                  },

                  child: const Text(
                    "REGISTER",
                    style: TextStyle(
                      fontSize: 18,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text("Already have an account? Login"),
                ),
              ),

            ],
          ),
        ),
      ),
    );
  }

  List<Widget> buildRoleFields() {

    switch(widget.role){

      case "Farmer":
        return [
          field("Farmer ID"),
          gap(),
          field("Village"),
          gap(),
          field("Taluk"),
          gap(),
          field("District"),
          gap(),
          field("State"),
        ];

      case "APMC Verified Dealer":
        return [
          field("Dealer License Number"),
          gap(),
          field("APMC Registration Number"),
          gap(),
          field("Business Name"),
          gap(),
          field("GST Number"),
        ];

      case "APMC Officer":
        return [
          field("Officer ID"),
          gap(),
          field("APMC Name"),
          gap(),
          field("Designation"),
        ];

      case "Transport Provider":
        return [
          field("Vehicle Number"),
          gap(),
          field("Vehicle Type"),
          gap(),
          field("Vehicle Capacity"),
        ];

      case "Warehouse Owner":
        return [
          field("Warehouse Name"),
          gap(),
          field("Storage Capacity"),
          gap(),
          field("Location"),
        ];

      case "Government":
        return [
          field("Employee ID"),
          gap(),
          field("Department"),
          gap(),
          field("Designation"),
        ];

      default:
        return [];
    }
  }

  Widget field(String label){
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
    );
  }

  Widget gap(){
    return const SizedBox(height: 18);
  }

}