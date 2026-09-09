import 'package:flutter/material.dart';
import '../../models/crop_model.dart';
import '../../models/auction_model.dart';
import '../../data/auction_data.dart';

class AuctionFormScreen extends StatefulWidget {
  final CropModel crop;

  const AuctionFormScreen({
    super.key,
    required this.crop,
  });

  @override
  State<AuctionFormScreen> createState() => _AuctionFormScreenState();
}

class _AuctionFormScreenState extends State<AuctionFormScreen> {
  final _formKey = GlobalKey<FormState>();

  final lotSizeController = TextEditingController();
  final basePriceController = TextEditingController();

  DateTime? selectedDate;
  String selectedTime = "09:00 AM - 10:00 AM";

  final List<String> timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
  ];

  Future<void> pickDate() async {
    DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2035),
    );

    if (picked != null) {
      setState(() {
        selectedDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xffF5F7FA),
      appBar: AppBar(
        title: const Text("Auction Details"),
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
                initialValue: widget.crop.cropName,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Crop Name",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                initialValue:
                    "${widget.crop.quantity} ${widget.crop.unit}",
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: "Available Quantity",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: lotSizeController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: "Lot Size (${widget.crop.unit})",
                  border: const OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Enter Lot Size";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: basePriceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Base Price per Lot (₹)",
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Enter Base Price";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 20),

              ListTile(
                title: Text(
                  selectedDate == null
                      ? "Select Auction Date"
                      : "${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}",
                ),
                trailing: const Icon(Icons.calendar_month),
                onTap: pickDate,
              ),

              const SizedBox(height: 20),

              DropdownButtonFormField<String>(
                value: selectedTime,
                decoration: const InputDecoration(
                  labelText: "Auction Time",
                  border: OutlineInputBorder(),
                ),
                items: timeSlots.map((slot) {
                  return DropdownMenuItem(
                    value: slot,
                    child: Text(slot),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedTime = value!;
                  });
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
    onPressed: () {
      if (!_formKey.currentState!.validate()) {
        return;
      }

      if (selectedDate == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Please select Auction Date"),
          ),
        );
        return;
      }

      double availableQty =
          double.tryParse(widget.crop.quantity) ?? 0;

      double lotSize =
          double.tryParse(lotSizeController.text) ?? 0;

      if (lotSize <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Enter a valid Lot Size"),
          ),
        );
        return;
      }

      int totalLots = (availableQty / lotSize).ceil();

      AuctionData.auctions.add(
        AuctionModel(
  cropName: widget.crop.cropName,

  availableQuantity:
      "${widget.crop.quantity} ${widget.crop.unit}",

  village: widget.crop.village,

  lotSize:
      "${lotSizeController.text} ${widget.crop.unit}",

  totalLots: totalLots,

  availableLots: totalLots,

  basePrice:
      double.parse(basePriceController.text),

  currentBid:
      double.parse(basePriceController.text),

  lowerCircuit:
      double.parse(basePriceController.text) * 0.85,

  auctionDate:
      "${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}",

  auctionTime: selectedTime,

  status: "Pending Officer Approval",
)
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Auction Created Successfully"),
        ),
      );

      Navigator.pop(context, true);
    }, // <-- IMPORTANT COMMA HERE
    child: const Text(
      "CREATE AUCTION",
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