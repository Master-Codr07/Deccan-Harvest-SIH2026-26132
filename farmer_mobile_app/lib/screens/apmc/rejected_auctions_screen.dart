import 'package:flutter/material.dart';
import '../../data/auction_data.dart';

class RejectedAuctionsScreen extends StatelessWidget {
  const RejectedAuctionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final rejectedAuctions = AuctionData.auctions
        .where((auction) => auction.status == "Rejected")
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Rejected Auctions"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: rejectedAuctions.isEmpty
          ? const Center(
              child: Text(
                "No Rejected Auctions",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: rejectedAuctions.length,
              itemBuilder: (context, index) {
                final auction = rejectedAuctions[index];

                return Card(
                  elevation: 5,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [

                        Text(
                          auction.cropName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        const SizedBox(height: 12),

                        Text("Village : ${auction.village}"),

                        Text("Quantity : ${auction.availableQuantity}"),

                        Text("Lot Size : ${auction.lotSize}"),

                        Text(
                          "Base Price : ₹${auction.basePrice.toStringAsFixed(2)}",
                        ),

                        const SizedBox(height: 15),

                        const Chip(
                          backgroundColor: Colors.red,
                          label: Text(
                            "REJECTED",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}