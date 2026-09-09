import 'package:flutter/material.dart';
import '../../data/auction_data.dart';

class PendingAuctionsScreen extends StatefulWidget {
  const PendingAuctionsScreen({super.key});

  @override
  State<PendingAuctionsScreen> createState() =>
      _PendingAuctionsScreenState();
}

class _PendingAuctionsScreenState
    extends State<PendingAuctionsScreen> {
  @override
  Widget build(BuildContext context) {
    final pendingAuctions = AuctionData.auctions
        .where((auction) =>
            auction.status == "Pending Officer Approval")
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Pending Auctions"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: pendingAuctions.isEmpty
          ? const Center(
              child: Text(
                "No Pending Auctions",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: pendingAuctions.length,
              itemBuilder: (context, index) {
                final auction = pendingAuctions[index];

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  elevation: 5,
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

                        Text(
                          "Available Quantity : ${auction.availableQuantity}",
                        ),

                        Text(
                          "Lot Size : ${auction.lotSize}",
                        ),

                        Text(
                          "Available Lots : ${auction.availableLots}",
                        ),

                        Text(
                          "Base Price : ₹${auction.basePrice.toStringAsFixed(2)}",
                        ),

                        Text(
                          "Auction Date : ${auction.auctionDate}",
                        ),

                        Text(
                          "Auction Time : ${auction.auctionTime}",
                        ),

                        const SizedBox(height: 20),

                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  foregroundColor: Colors.white,
                                ),
                                onPressed: () {
                                  setState(() {
                                    auction.status = "Rejected";
                                  });

                                  ScaffoldMessenger.of(context)
                                      .showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        "Auction Rejected",
                                      ),
                                    ),
                                  );
                                },
                                child: const Text("Reject"),
                              ),
                            ),

                            const SizedBox(width: 15),

                            Expanded(
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                ),
                                onPressed: () {
                                  setState(() {
                                    // Make auction live
                                    auction.status = "Live";

                                    // Start bidding from farmer's base price
                                    auction.currentBid =
                                        auction.basePrice;

                                    // Auction duration
                                    auction.endTime =
                                        DateTime.now().add(
                                      const Duration(minutes: 2),
                                    );

                                    // Auction is open
                                    auction.isClosed = false;
                                  });

                                  ScaffoldMessenger.of(context)
                                      .showSnackBar(
                                    const SnackBar(
                                      backgroundColor: Colors.green,
                                      content: Text(
                                        "Auction Approved & Live Successfully",
                                      ),
                                    ),
                                  );
                                },
                                child: const Text("Approve"),
                              ),
                            ),
                          ],
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