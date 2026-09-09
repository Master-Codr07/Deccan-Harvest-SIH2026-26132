import 'package:flutter/material.dart';
import '../../data/warehouse_data.dart';
import '../../models/purchase_model.dart';
import '../buyer/transport_screen.dart';

class WarehouseScreen extends StatefulWidget {
  final PurchaseModel purchase;

  const WarehouseScreen({
    super.key,
    required this.purchase,
  });

  @override
  State<WarehouseScreen> createState() =>
      _WarehouseScreenState();
}

class _WarehouseScreenState
    extends State<WarehouseScreen> {

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),

      appBar: AppBar(
        title: const Text("Warehouse Allocation"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: WarehouseData.warehouses.length,

        itemBuilder: (context, index) {

          final warehouse =
              WarehouseData.warehouses[index];

          return Card(
            margin:
                const EdgeInsets.only(bottom: 16),

            elevation: 5,

            shape: RoundedRectangleBorder(
              borderRadius:
                  BorderRadius.circular(15),
            ),

            child: Padding(
              padding: const EdgeInsets.all(16),

              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,

                children: [

                  Text(
                    warehouse.warehouseName,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 12),

                  Text(
                    "Location : ${warehouse.location}",
                  ),

                  Text(
                    "Capacity : ${warehouse.capacity}",
                  ),

                  Text(
                    "Occupied : ${warehouse.occupied}",
                  ),

                  Text(
                    "Available : ${warehouse.availableSpace}",
                  ),

                  const SizedBox(height: 20),
                  SizedBox(
  width: double.infinity,
  height: 50,
  child: ElevatedButton(
    style: ElevatedButton.styleFrom(
      backgroundColor: Colors.green,
      foregroundColor: Colors.white,
    ),
    onPressed: () {

      if (warehouse.availableSpace <
          widget.purchase.lotsPurchased) {

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              "Not enough warehouse capacity",
            ),
          ),
        );

        return;
      }

      setState(() {
        warehouse.occupied +=
            widget.purchase.lotsPurchased;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "${warehouse.warehouseName} Assigned Successfully",
          ),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => TransportScreen(
            purchase: widget.purchase,
            warehouse: warehouse,
          ),
        ),
      );
    },
    child: const Text(
      "SELECT WAREHOUSE",
      style: TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.bold,
      ),
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