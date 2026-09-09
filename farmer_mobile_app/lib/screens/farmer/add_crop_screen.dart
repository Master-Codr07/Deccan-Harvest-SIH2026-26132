import 'package:flutter/material.dart';
import '../../models/crop_model.dart';
import '../../data/crop_data.dart';

class AddCropScreen extends StatefulWidget {
  const AddCropScreen({super.key});

  @override
  State<AddCropScreen> createState() => _AddCropScreenState();
}

class _AddCropScreenState extends State<AddCropScreen> {
  final _formKey = GlobalKey<FormState>();

  final cropController = TextEditingController();
  final quantityController = TextEditingController();
  final villageController = TextEditingController();

  String unit = "Kg";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Crop"),
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
                controller: cropController,
                decoration: const InputDecoration(
                  labelText: "Crop Name",
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                    value!.isEmpty ? "Enter crop name" : null,
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: quantityController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Quantity",
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                    value!.isEmpty ? "Enter quantity" : null,
              ),

              const SizedBox(height: 20),

              DropdownButtonFormField<String>(
                value: unit,
                decoration: const InputDecoration(
                  labelText: "Unit",
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(
                    value: "Kg",
                    child: Text("Kg"),
                  ),
                  DropdownMenuItem(
                    value: "Quintal",
                    child: Text("Quintal"),
                  ),
                  DropdownMenuItem(
                    value: "Ton",
                    child: Text("Ton"),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    unit = value!;
                  });
                },
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: villageController,
                decoration: const InputDecoration(
                  labelText: "Village",
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 25),

              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.image),
                label: const Text("Upload Crop Image"),
              ),

              const SizedBox(height: 15),

              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.videocam),
                label: const Text("Upload Field Video"),
              ),

              const SizedBox(height: 35),

              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {

                      // Save crop
                      CropData.crops.add(
                        CropModel(
                          cropName: cropController.text,
                          quantity: quantityController.text,
                          unit: unit,
                          village: villageController.text,
                          status: "Pending Verification",
                        ),
                      );

                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Crop Added Successfully"),
                        ),
                      );

                      Navigator.pop(context);
                    }
                  },
                  child: const Text(
                    "SAVE CROP",
                    style: TextStyle(fontSize: 18),
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