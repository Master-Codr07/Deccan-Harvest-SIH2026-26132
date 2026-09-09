import 'package:flutter/material.dart';
import '../../data/auction_data.dart';

class MyAuctionsScreen extends StatelessWidget {
  const MyAuctionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("My Auctions"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: AuctionData.auctions.isEmpty
          ? const Center(
              child: Text(
                "No Auctions Created Yet",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: AuctionData.auctions.length,
              itemBuilder: (context, index) {
                final auction = AuctionData.auctions[index];

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

                        const SizedBox(height: 15),

                        Text(
                          "Available Quantity : ${auction.availableQuantity}",
                        ),

                        const SizedBox(height: 8),

                        Text(
                          "Lot Size : ${auction.lotSize}",
                        ),

                        const SizedBox(height: 8),

                        Text(
                          "Total Lots : ${auction.totalLots}",
                        ),

                        const SizedBox(height: 8),

                        Text(
                          "Village : ${auction.village}",
                        ),

                        const SizedBox(height: 8),

                        Text(
                          "Base Price : ₹${auction.basePrice}",
                        ),

                        const SizedBox(height: 8),

                        Text(
                          "Auction Date : ${auction.auctionDate}",
                        ),

                        const SizedBox(height: 8),

                        Text(
                          "Auction Time : ${auction.auctionTime}",
                        ),

                        const SizedBox(height: 15),

                        Chip(
                          backgroundColor: Colors.orange,
                          label: Text(
                            auction.status,
                            style: const TextStyle(
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