import 'package:flutter/material.dart';
import 'live_auctions_screen.dart';
import 'purchase_history_screen.dart';

class BuyerDashboard extends StatelessWidget {
  const BuyerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> options = [
      {
        "title": "Live Auctions",
        "icon": Icons.gavel,
      },
      {
        "title": "My Bids",
        "icon": Icons.currency_rupee,
      },
      {
        "title": "Won Lots",
        "icon": Icons.inventory,
      },
      {
        "title": "Payments",
        "icon": Icons.account_balance_wallet,
      },
      {
        "title": "Profile",
        "icon": Icons.person,
      },
      {
        "title": "Purchase History",
        "icon": Icons.history,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Buyer Dashboard"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.builder(
          itemCount: options.length,
          gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemBuilder: (context, index) {
            final item = options[index];

            return Card(
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () {
                  if (item["title"] == "Live Auctions") {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const LiveAuctionsScreen(),
                      ),
                    );
                  } else if (item["title"] == "Purchase History") {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const PurchaseHistoryScreen(),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          "${item["title"]} Coming Soon",
                        ),
                      ),
                    );
                  }
                },
                child: Column(
                  mainAxisAlignment:
                      MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor:
                          Colors.green.shade100,
                      child: Icon(
                        item["icon"],
                        color: Colors.green,
                        size: 35,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      item["title"],
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}