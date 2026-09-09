import 'package:flutter/material.dart';
import '../../data/auction_data.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {

    final auctions = AuctionData.auctions;

    final total = auctions.length;

    final pending = auctions
        .where((e) => e.status == "Pending Officer Approval")
        .length;

    final live = auctions
        .where((e) => e.status == "Live")
        .length;

    final completed = auctions
        .where((e) => e.isClosed)
        .length;

    final rejected = auctions
        .where((e) => e.status == "Rejected")
        .length;

    double revenue = 0;

    double highestBid = 0;

    for (var auction in auctions) {
      if (auction.isClosed) {
        revenue +=
            auction.finalPrice * auction.totalLots;

        if (auction.finalPrice > highestBid) {
          highestBid = auction.finalPrice;
        }
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Reports & Analytics"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        crossAxisSpacing: 15,
        mainAxisSpacing: 15,
        children: [

          reportCard("Total Auctions", "$total", Icons.list),

          reportCard("Pending", "$pending",
              Icons.pending_actions),

          reportCard("Live", "$live", Icons.gavel),

          reportCard("Completed", "$completed",
              Icons.check_circle),

          reportCard("Rejected", "$rejected",
              Icons.cancel),

          reportCard(
            "Highest Bid",
            "₹${highestBid.toStringAsFixed(2)}",
            Icons.currency_rupee,
          ),

          reportCard(
            "Revenue",
            "₹${revenue.toStringAsFixed(2)}",
            Icons.bar_chart,
          ),
        ],
      ),
    );
  }

  Widget reportCard(
      String title,
      String value,
      IconData icon,
      ) {
    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.center,
          children: [

            Icon(
              icon,
              color: Colors.green,
              size: 42,
            ),

            const SizedBox(height: 15),

            Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              title,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}