import 'package:flutter/material.dart';
import '../../models/auction_model.dart';
import 'payment_screen.dart';

class WinnerPurchaseScreen extends StatefulWidget {
  final AuctionModel auction;

  const WinnerPurchaseScreen({
    super.key,
    required this.auction,
  });

  @override
  State<WinnerPurchaseScreen> createState() =>
      _WinnerPurchaseScreenState();
}

class _WinnerPurchaseScreenState
    extends State<WinnerPurchaseScreen> {
  int selectedLots = 1;

  @override
  Widget build(BuildContext context) {
    final auction = widget.auction;

    double totalAmount =
        selectedLots * auction.finalPrice;

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Purchase Lots"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [

            Card(
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [

                    Text(
                      auction.cropName,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 20),

                    Text(
                      "Winning Price",
                      style: TextStyle(
                        color: Colors.grey.shade700,
                      ),
                    ),

                    const SizedBox(height: 8),

                    Text(
                      "₹${auction.finalPrice.toStringAsFixed(2)} / Lot",
                      style: const TextStyle(
                        fontSize: 30,
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 20),

                    Text(
                      "Available Lots : ${auction.availableLots}",
                      style: const TextStyle(
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 30),

            const Text(
              "Select Lots",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [

                IconButton(
                  icon: const Icon(Icons.remove_circle,
                      color: Colors.red, size: 40),
                  onPressed: () {
                    if (selectedLots > 1) {
                      setState(() {
                        selectedLots--;
                      });
                    }
                  },
                ),

                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    "$selectedLots",
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                IconButton(
                  icon: const Icon(Icons.add_circle,
                      color: Colors.green, size: 40),
                  onPressed: () {
                    if (selectedLots <
                        auction.availableLots) {
                      setState(() {
                        selectedLots++;
                      });
                    }
                  },
                ),
              ],
            ),

            const SizedBox(height: 30),

            Card(
              color: Colors.green.shade50,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [

                    const Text(
                      "Total Amount",
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ),

                    const SizedBox(height: 10),

                    Text(
                      "₹${totalAmount.toStringAsFixed(2)}",
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => PaymentScreen(
                        auction: auction,
                        selectedLots: selectedLots,
                        totalAmount: totalAmount,
                      ),
                    ),
                  );
                },
                child: const Text(
                  "PROCEED TO PAYMENT",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}