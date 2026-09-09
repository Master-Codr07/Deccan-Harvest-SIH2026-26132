import 'package:flutter/material.dart';
import '../../data/auction_data.dart';

class CompletedAuctionsScreen extends StatelessWidget {
  const CompletedAuctionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final completedAuctions = AuctionData.auctions
        .where((auction) => auction.isClosed)
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Completed Auctions"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: completedAuctions.isEmpty
          ? const Center(
              child: Text(
                "No Completed Auctions",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: completedAuctions.length,
              itemBuilder: (context, index) {
                final auction = completedAuctions[index];

                return Card(
                  elevation: 5,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
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

                        Text(
                            "Quantity : ${auction.availableQuantity}"),

                        Text(
                            "Lot Size : ${auction.lotSize}"),

                        Text(
                            "Total Lots : ${auction.totalLots}"),

                        Text(
                            "Remaining Lots : ${auction.availableLots}"),

                        const Divider(),

                        Text(
                          "Base Price : ₹${auction.basePrice.toStringAsFixed(2)}",
                        ),

                        Text(
                          "Winning Price : ₹${auction.finalPrice.toStringAsFixed(2)}",
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),

                        const SizedBox(height: 12),

                        const Chip(
                          backgroundColor: Colors.green,
                          label: Text(
                            "COMPLETED",
                            style: TextStyle(
                              color: Colors.white,
                            ),
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