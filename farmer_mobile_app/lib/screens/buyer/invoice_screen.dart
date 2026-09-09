import 'package:flutter/material.dart';
import '../../models/purchase_model.dart';

class InvoiceScreen extends StatelessWidget {
  final PurchaseModel purchase;

  const InvoiceScreen({
    super.key,
    required this.purchase,
  });

  @override
  Widget build(BuildContext context) {

    final invoiceId =
        "INV${DateTime.now().millisecondsSinceEpoch}";

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),

      appBar: AppBar(
        title: const Text("Invoice"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),

        child: Card(
          elevation: 5,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),

          child: Padding(
            padding: const EdgeInsets.all(20),

            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,

              children: [

                const Center(
                  child: Text(
                    "PURCHASE INVOICE",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

                const Divider(height: 35),

                Text(
                  "Invoice ID : $invoiceId",
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 15),

                Text(
                  "Buyer : ${purchase.buyerName}",
                ),

                Text(
                  "Crop : ${purchase.cropName}",
                ),

                Text(
                  "Lots Purchased : ${purchase.lotsPurchased}",
                ),

                Text(
                  "Price Per Lot : ₹${purchase.pricePerLot.toStringAsFixed(2)}",
                ),

                const SizedBox(height: 20),
                                const Divider(height: 35),

                Text(
                  "Total Amount : ₹${purchase.totalAmount.toStringAsFixed(2)}",
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),

                const SizedBox(height: 15),

                Text(
                  "Payment Status : ${purchase.status}",
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 15),

                Text(
                  "Purchase Date : ${DateTime.now().day}/"
                  "${DateTime.now().month}/"
                  "${DateTime.now().year}",
                ),

                const SizedBox(height: 40),

                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            "Invoice Download Feature Coming Soon",
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.download),
                    label: const Text(
                      "DOWNLOAD INVOICE",
                      style: TextStyle(
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 15),

                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.popUntil(
                        context,
                        (route) => route.isFirst,
                      );
                    },
                    child: const Text(
                      "BACK TO HOME",
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
      ),
    );
  }
}