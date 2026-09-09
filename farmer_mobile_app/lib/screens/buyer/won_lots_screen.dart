import 'package:flutter/material.dart';
import '../../data/auction_data.dart';
import 'purchase_lots_screen.dart';

class WonLotsScreen extends StatelessWidget {
  const WonLotsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final wonLots = AuctionData.auctions.where((auction) {
      return auction.status == "Closed" &&
          auction.winnerName != null &&
          auction.winnerName!.isNotEmpty;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Won Lots"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: wonLots.isEmpty
          ? const Center(
              child: Text(
                "No Won Lots",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: wonLots.length,
              itemBuilder: (context, index) {
                final auction = wonLots[index];

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
                            fontSize: 21,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        const SizedBox(height: 10),

                        Text("Winner : ${auction.winnerName}"),

                        Text(
                          "Winning Price : ₹${auction.finalPrice.toStringAsFixed(2)}",
                        ),

                        Text(
                          "Available Lots : ${auction.availableLots}",
                        ),

                        const SizedBox(height: 15),

                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      PurchaseLotsScreen(
                                    auction: auction,
                                  ),
                                ),
                              );
                            },
                            child: const Text(
                              "PURCHASE LOTS",
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