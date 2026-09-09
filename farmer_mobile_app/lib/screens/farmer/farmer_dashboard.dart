import 'package:flutter/material.dart';
import 'my_crops_screen.dart';
import 'create_auction_screen.dart';
import 'my_auctions_screen.dart';

class FarmerDashboard extends StatelessWidget {
  const FarmerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> options = [
      {
        "title": "My Crops",
        "icon": Icons.grass,
      },
      {
        "title": "Create Auction",
        "icon": Icons.gavel,
      },
      {
        "title": "My Auctions",
        "icon": Icons.inventory,
      },
      {
        "title": "Payments",
        "icon": Icons.account_balance_wallet,
      },
      {
        "title": "Transport",
        "icon": Icons.local_shipping,
      },
      {
        "title": "Warehouse",
        "icon": Icons.warehouse,
      },
      {
        "title": "Market Prices",
        "icon": Icons.show_chart,
      },
      {
        "title": "Profile",
        "icon": Icons.person,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        title: const Text("Farmer Dashboard"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.builder(
          itemCount: options.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1,
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
                  switch (item["title"]) {
                    case "My Crops":
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const MyCropsScreen(),
                        ),
                      );
                      break;

                    case "Create Auction":
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const CreateAuctionScreen(),
                        ),
                      );
                      break;

                    case "My Auctions":
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const MyAuctionsScreen(),
                        ),
                      );
                      break;

                    default:
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            "${item["title"]} module coming soon",
                          ),
                        ),
                      );
                  }
                },
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: Colors.green.shade100,
                      child: Icon(
                        item["icon"],
                        size: 35,
                        color: Colors.green,
                      ),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      item["title"],
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
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