import 'package:flutter/material.dart';
import '../../data/purchase_data.dart';
import 'invoice_screen.dart';

class PurchaseHistoryScreen extends StatelessWidget {
  const PurchaseHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final purchases = PurchaseData.purchases;

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Purchase History"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: purchases.isEmpty
          ? const Center(
              child: Text(
                "No Purchases Yet",
                style: TextStyle(fontSize: 18),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: purchases.length,
              itemBuilder: (context, index) {
                final purchase = purchases[index];

                return Card(
                  margin: const EdgeInsets.only(bottom: 15),
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [

                        Text(
                          purchase.cropName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        const SizedBox(height: 10),

                        Text("Buyer : ${purchase.buyerName}"),
                        Text("Lots Purchased : ${purchase.lotsPurchased}"),
                        Text(
                          "Price / Lot : ₹${purchase.pricePerLot.toStringAsFixed(2)}",
                        ),

                        Text(
                          "Total Amount : ₹${purchase.totalAmount.toStringAsFixed(2)}",
                        ),

                        const SizedBox(height: 10),

                        Chip(
                          backgroundColor:
                              purchase.status == "Paid"
                                  ? Colors.green
                                  : Colors.orange,
                          label: Text(
                            purchase.status,
                            style: const TextStyle(
                              color: Colors.white,
                            ),
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
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      InvoiceScreen(
                                    purchase: purchase,
                                  ),
                                ),
                              );
                            },
                            child: const Text("VIEW INVOICE"),
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