import 'package:flutter/material.dart';
import 'login_screen.dart';
class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> roles = [
      {
        "title": "Farmer",
        "subtitle": "Sell your crops",
        "icon": Icons.agriculture,
      },
      {
        "title": "Buyer",
        "subtitle": "Participate in auctions",
        "icon": Icons.shopping_cart,
      },
      {
        "title": "APMC Officer",
        "subtitle": "Manage & Verify",
        "icon": Icons.account_balance,
      },
      {
        "title": "Transport",
        "subtitle": "Deliver crops",
        "icon": Icons.local_shipping,
      },
      {
        "title": "Warehouse",
        "subtitle": "Manage storage",
        "icon": Icons.warehouse,
      },
      {
        "title": "Government",
        "subtitle": "Analytics & Reports",
        "icon": Icons.account_balance_outlined,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        backgroundColor: Colors.green,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "Select Your Role",
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.builder(
          itemCount: roles.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 0.95,
          ),
          itemBuilder: (context, index) {
            final role = roles[index];

            return InkWell(
              borderRadius: BorderRadius.circular(18),
              onTap: () {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => LoginScreen(
        role: role["title"],
      ),
    ),
  );
},
              child: Card(
                elevation: 5,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: Colors.green.shade100,
                        child: Icon(
                          role["icon"],
                          size: 36,
                          color: Colors.green,
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        role["title"],
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        role["subtitle"],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}