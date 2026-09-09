import 'package:flutter/material.dart';
import '../officer/pending_auctions_screen.dart';
import 'live_auctions_screen.dart';
import 'completed_auctions_screen.dart';
import 'rejected_auctions_screen.dart';
import 'reports_screen.dart';
class ApmcDashboard extends StatelessWidget {
  const ApmcDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> options = [
      {
        "title": "Pending Auctions",
        "icon": Icons.pending_actions,
      },
      {
        "title": "Live Auctions",
        "icon": Icons.gavel,
      },
      {
        "title": "Completed Auctions",
        "icon": Icons.check_circle,
      },
      {
        "title": "Rejected Auctions",
        "icon": Icons.cancel,
      },
      {
        "title": "Reports",
        "icon": Icons.bar_chart,
      },
      {
        "title": "Profile",
        "icon": Icons.person,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("APMC Officer Dashboard"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
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

  if (item["title"] == "Pending Auctions") {

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const PendingAuctionsScreen(),
      ),
    );

  } else if (item["title"] == "Live Auctions") {

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const LiveAuctionsScreen(),
      ),
    );

  } else if (item["title"] == "Completed Auctions") {

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const CompletedAuctionsScreen(),
      ),
    );

  } else if (item["title"] == "Rejected Auctions") {

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const RejectedAuctionsScreen(),
      ),
    );

  } else if (item["title"] == "Reports") {

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const ReportsScreen(),
      ),
    );

  } else {

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("${item["title"]} Coming Soon"),
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