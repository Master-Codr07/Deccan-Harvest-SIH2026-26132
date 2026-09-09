import 'package:flutter/material.dart';
import '../../models/auction_model.dart';

class PlaceBidScreen extends StatefulWidget {
  final AuctionModel auction;

  const PlaceBidScreen({
    super.key,
    required this.auction,
  });

  @override
  State<PlaceBidScreen> createState() => _PlaceBidScreenState();
}

class _PlaceBidScreenState extends State<PlaceBidScreen> {
  final _formKey = GlobalKey<FormState>();

  final bidController = TextEditingController();

  double get minimumBid => widget.auction.currentBid * 1.20;

  @override
  void dispose() {
    bidController.dispose();
    super.dispose();
  }

  void submitBid() {
    if (!_formKey.currentState!.validate()) return;

    double enteredBid =
        double.tryParse(bidController.text) ?? 0;

    if (enteredBid < minimumBid) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "Minimum Bid should be ₹${minimumBid.toStringAsFixed(2)}",
          ),
        ),
      );
      return;
    }

    setState(() {
      widget.auction.currentBid = enteredBid;
widget.auction.winnerName = "Demo Buyer";

      // Replace with logged-in buyer details later
      widget.auction.highestBidder = "Buyer 1";
      widget.auction.highestBidderId = "buyer001";
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Bid Placed Successfully"),
        backgroundColor: Colors.green,
      ),
    );

    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Place Bid"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                initialValue: widget.auction.cropName,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Crop",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                initialValue:
                    "₹${widget.auction.currentBid.toStringAsFixed(2)}",
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Current Bid",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                initialValue:
                    "₹${minimumBid.toStringAsFixed(2)}",
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Minimum Next Bid",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: bidController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Enter Your Bid",
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Enter Bid Amount";
                  }

                  if (double.tryParse(value) == null) {
                    return "Enter a valid amount";
                  }

                  return null;
                },
              ),

              const SizedBox(height: 30),

              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: submitBid,
                  child: const Text(
                    "PLACE BID",
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
      ),
    );
  }
}