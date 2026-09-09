import 'package:flutter/material.dart';
import '../../data/auction_data.dart';
import 'live_auction_detail_screen.dart';

class LiveAuctionsScreen extends StatefulWidget {
  const LiveAuctionsScreen({super.key});

  @override
  State<LiveAuctionsScreen> createState() => _LiveAuctionsScreenState();
}

class _LiveAuctionsScreenState extends State<LiveAuctionsScreen> {
  @override
  Widget build(BuildContext context) {
    final liveAuctions = AuctionData.auctions
        .where((auction) => auction.status == "Live")
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Live Auctions"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: liveAuctions.isEmpty
          ? const Center(
              child: Text(
                "No Live Auctions Available",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: liveAuctions.length,
              itemBuilder: (context, index) {
                final auction = liveAuctions[index];

                Duration remaining = Duration.zero;

                if (auction.endTime != null) {
                  remaining =
                      auction.endTime!.difference(DateTime.now());

                  if (remaining.isNegative) {
                    remaining = Duration.zero;
                  }
                }

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
                            fontSize: 21,
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

                        const Divider(),

                        Text(
                          "Base Price : ₹${auction.basePrice.toStringAsFixed(2)}",
                        ),

                        Text(
                          "Current Bid : ₹${auction.currentBid.toStringAsFixed(2)}",
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),

                        Text(
                          "Lower Circuit : ₹${auction.lowerCircuit.toStringAsFixed(2)}",
                        ),

                        const SizedBox(height: 10),

                        if (!auction.isClosed)
                          Text(
                            "Time Left : ${remaining.inMinutes}:${(remaining.inSeconds % 60).toString().padLeft(2, '0')}",
                            style: const TextStyle(
                              color: Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),

                        if (auction.isClosed)
                          Text(
                            "Final Price : ₹${auction.finalPrice.toStringAsFixed(2)}",
                            style: const TextStyle(
                              color: Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),

                        const SizedBox(height: 15),

                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: auction.isClosed
                                ? null
                                : () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) =>
                                            LiveAuctionDetailScreen(
                                          auction: auction,
                                        ),
                                      ),
                                    ).then((_) {
                                      setState(() {});
                                    });
                                  },
                            child: Text(
                              auction.isClosed
                                  ? "AUCTION CLOSED"
                                  : "VIEW AUCTION",
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