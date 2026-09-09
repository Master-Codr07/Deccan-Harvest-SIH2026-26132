import 'package:flutter/material.dart';
import '../../models/auction_model.dart';
import '../../models/purchase_model.dart';
import '../../data/purchase_data.dart';
import 'payment_screen.dart';

class PurchaseLotsScreen extends StatefulWidget {
  final AuctionModel auction;

  const PurchaseLotsScreen({
    super.key,
    required this.auction,
  });

  @override
  State<PurchaseLotsScreen> createState() =>
      _PurchaseLotsScreenState();
}

class _PurchaseLotsScreenState
    extends State<PurchaseLotsScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController lotsController =
      TextEditingController();

  double totalAmount = 0;

  void calculateAmount() {
    int lots =
        int.tryParse(lotsController.text) ?? 0;

    setState(() {
      totalAmount =
          lots * widget.auction.finalPrice;
    });
  }

  void purchaseLots() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    int lots = int.parse(lotsController.text);

    if (lots > widget.auction.availableLots) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Requested lots exceed available lots",
          ),
        ),
      );
      return;
    }

    widget.auction.availableLots -= lots;

    if (widget.auction.availableLots == 0) {
      widget.auction.status = "Sold";
    }

    PurchaseData.purchases.add(
      PurchaseModel(
        cropName: widget.auction.cropName,
        buyerName:
            widget.auction.winnerName ?? "Winner",
        pricePerLot: widget.auction.finalPrice,
        lotsPurchased: lots,
        totalAmount: totalAmount,
        status: "Payment Pending",
      ),
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          purchase: PurchaseData.purchases.last,
        ),
      ),
    );
  }

  @override
  void dispose() {
    lotsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Purchase Lots"),
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
                    "₹${widget.auction.finalPrice.toStringAsFixed(2)}",
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Winning Price / Lot",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                initialValue:
                    widget.auction.availableLots.toString(),
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Available Lots",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                initialValue:
                    widget.auction.winnerName ??
                        "No Winner",
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Winning Buyer",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: lotsController,
                keyboardType: TextInputType.number,
                onChanged: (value) =>
                    calculateAmount(),
                decoration: const InputDecoration(
                  labelText: "Lots Required",
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null ||
                      value.isEmpty) {
                    return "Enter number of lots";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 25),

              Card(
                color: Colors.green.shade50,
                child: Padding(
                  padding:
                      const EdgeInsets.all(20),
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
                          fontWeight:
                              FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 25),

              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style:
                      ElevatedButton.styleFrom(
                    backgroundColor:
                        Colors.green,
                    foregroundColor:
                        Colors.white,
                  ),
                  onPressed: purchaseLots,
                  child: const Text(
                    "PURCHASE LOTS",
                    style: TextStyle(
                      fontSize: 18,
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