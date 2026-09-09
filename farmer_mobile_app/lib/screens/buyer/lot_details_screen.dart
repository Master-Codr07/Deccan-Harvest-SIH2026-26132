import 'package:flutter/material.dart';
import '../../models/auction_model.dart';

class LotDetailsScreen extends StatefulWidget {
  final AuctionModel auction;

  const LotDetailsScreen({
    super.key,
    required this.auction,
  });

  @override
  State<LotDetailsScreen> createState() => _LotDetailsScreenState();
}

class _LotDetailsScreenState extends State<LotDetailsScreen> {
  final bidController = TextEditingController();

  void placeBid() {
    showDialog(
      context: context,
      builder: (context) {
        bidController.clear();

        return AlertDialog(
          title: const Text("Place Bid"),
          content: TextField(
            controller: bidController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: "Bid Amount",
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                double bid =
                    double.tryParse(bidController.text) ?? 0;

                if (bid > widget.auction.currentBid) {
                  setState(() {
                    widget.auction.currentBid = bid;
                  });

                  Navigator.pop(context);

                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Bid Placed Successfully"),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        "Bid must be greater than ₹${widget.auction.currentBid}",
                      ),
                    ),
                  );
                }
              },
              child: const Text("Submit"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    int lots = widget.auction.totalLots;

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: Text(widget.auction.cropName),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: lots,
        itemBuilder: (context, index) {
          return Card(
            margin: const EdgeInsets.only(bottom: 15),
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [

                  Text(
                    "Lot ${index + 1}",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 10),

                  Text(
                    "Lot Size : ${widget.auction.lotSize}",
                  ),

                  Text(
                    "Current Bid : ₹${widget.auction.currentBid.toStringAsFixed(2)}",
                  ),

                  const SizedBox(height: 15),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                      onPressed: placeBid,
                      child: const Text("Place Bid"),
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