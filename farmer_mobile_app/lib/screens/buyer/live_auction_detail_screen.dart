import 'dart:async';
import 'package:flutter/material.dart';
import '../../models/auction_model.dart';
import 'purchase_lots_screen.dart';
class LiveAuctionDetailScreen extends StatefulWidget {
  final AuctionModel auction;

  const LiveAuctionDetailScreen({
    super.key,
    required this.auction,
  });

  @override
  State<LiveAuctionDetailScreen> createState() =>
      _LiveAuctionDetailScreenState();
}

class _LiveAuctionDetailScreenState
    extends State<LiveAuctionDetailScreen> {

  Timer? timer;

  Duration remainingTime = Duration.zero;

  final TextEditingController bidController =
      TextEditingController();

  @override
  void initState() {
    super.initState();

    if (widget.auction.endTime != null) {
      remainingTime =
          widget.auction.endTime!.difference(DateTime.now());
    }

    startTimer();
  }

  void startTimer() {
    if (widget.auction.endTime == null) return;

    timer = Timer.periodic(
      const Duration(seconds: 1),
      (timer) {
        final difference =
            widget.auction.endTime!.difference(DateTime.now());

        if (difference.inSeconds <= 0) {
          timer.cancel();

          setState(() {
  widget.auction.isClosed = true;

  widget.auction.finalPrice =
      widget.auction.currentBid;

  widget.auction.status = "Completed";

  // Save Winner
  widget.auction.winnerName =
      widget.auction.highestBidder ?? "No Winner";

  remainingTime = Duration.zero;
});
        } else {
          setState(() {
            remainingTime = difference;
          });
        }
      },
    );
  }

  double get minimumBid =>
      widget.auction.currentBid * 1.20;

  void placeBid() {
  if (widget.auction.isClosed) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Auction has already ended"),
      ),
    );
    return;
  }

  double enteredBid =
      double.tryParse(bidController.text) ?? 0;

  if (enteredBid < minimumBid) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          "Minimum Next Bid should be ₹${minimumBid.toStringAsFixed(2)}",
        ),
      ),
    );
    return;
  }

  setState(() {
    widget.auction.currentBid = enteredBid;

    // Highest bidder (Demo)
    widget.auction.highestBidder = "Buyer 1";
    widget.auction.highestBidderId = "BUY001";
  });

  bidController.clear();

  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text("Bid Placed Successfully"),
    ),
  );
}

  @override
  void dispose() {
    timer?.cancel();
    bidController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auction = widget.auction;

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Live Auction"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            Card(
              elevation: 4,
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
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 15),

                    Text(
                        "Available Quantity : ${auction.availableQuantity}"),

                    Text(
                        "Lot Size : ${auction.lotSize}"),

                    Text(
                        "Available Lots : ${auction.availableLots}"),

                    const Divider(),

                    Text(
                        "Base Price : ₹${auction.basePrice.toStringAsFixed(2)}"),

                    Text(
                        "Lower Circuit : ₹${auction.lowerCircuit.toStringAsFixed(2)}"),

                    const SizedBox(height: 10),

                    Text(
                      "Current Bid : ₹${auction.currentBid.toStringAsFixed(2)}",
                      style: const TextStyle(
                        fontSize: 22,
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 10),

                    Text(
                        "Auction Date : ${auction.auctionDate}"),

                    Text(
                        "Auction Time : ${auction.auctionTime}"),

                    const SizedBox(height: 10),

                    Chip(
                      backgroundColor: auction.isClosed
                          ? Colors.red
                          : Colors.green,
                      label: Text(
                        auction.isClosed
                            ? "Auction Closed"
                            : "Auction Live",
                        style: const TextStyle(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            Card(
              color: Colors.red.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [

                    const Text(
                      "Auction Ends In",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 10),

                    Text(
                      "${remainingTime.inHours.toString().padLeft(2,'0')}:"
                      "${(remainingTime.inMinutes % 60).toString().padLeft(2,'0')}:"
                      "${(remainingTime.inSeconds % 60).toString().padLeft(2,'0')}",
                      style: const TextStyle(
                        fontSize: 34,
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 25),
                        if (!auction.isClosed)
              Card(
                elevation: 5,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Text(
                        "LIVE BIDDING",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 20),

                      Text(
                        "Current Bid",
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 16,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Text(
                        "₹${auction.currentBid.toStringAsFixed(2)}",
                        style: const TextStyle(
                          fontSize: 34,
                          color: Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 20),

                      Text(
                        "Minimum Next Bid",
                        style: TextStyle(
                          color: Colors.grey.shade700,
                          fontSize: 16,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Text(
                        "₹${minimumBid.toStringAsFixed(2)}",
                        style: const TextStyle(
                          fontSize: 22,
                          color: Colors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 20),

                      TextField(
                        controller: bidController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: "Enter Your Bid",
                          border: OutlineInputBorder(),
                        ),
                      ),

                      const SizedBox(height: 25),

                      SizedBox(
                        width: double.infinity,
                        height: 55,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                          onPressed: placeBid,
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

            if (auction.isClosed)
  Card(
    color: Colors.green.shade50,
    child: Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [

          const Text(
            "AUCTION CLOSED",
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.red,
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            "Winning Price Per Lot",
            style: TextStyle(fontSize: 16),
          ),

          const SizedBox(height: 8),

          Text(
            "₹${auction.finalPrice.toStringAsFixed(2)}",
            style: const TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.bold,
              color: Colors.green,
            ),
          ),
          const SizedBox(height: 20),

Text(
  "Winner",
  style: TextStyle(
    color: Colors.grey,
  ),
),

const SizedBox(height: 8),

Text(
  auction.winnerName ?? "No Winner",
  style: const TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
  ),
),

          const SizedBox(height: 25),

          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
              onPressed: auction.availableLots == 0
                  ? null
                  : () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PurchaseLotsScreen(
                            auction: auction,
                          ),
                        ),
                      ).then((_) {
                        setState(() {});
                      });
                    },
              child: Text(
                auction.availableLots == 0
                    ? "ALL LOTS SOLD"
                    : "PURCHASE LOTS",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          if (auction.availableLots > 0) ...[
            const SizedBox(height: 15),

            Text(
              "Remaining Lots : ${auction.availableLots}",
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ],
      ),
    ),
  ),
          ],
        ),
      ),
    );
  }
}