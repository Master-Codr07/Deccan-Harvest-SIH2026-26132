import '../models/warehouse_model.dart';

class WarehouseData {
  static List<WarehouseModel> warehouses = [

    WarehouseModel(
      warehouseName: "APMC Central Warehouse",
      location: "Mysuru",
      capacity: 500,
      occupied: 120,
    ),

    WarehouseModel(
      warehouseName: "Green Agro Storage",
      location: "Mandya",
      capacity: 400,
      occupied: 200,
    ),

    WarehouseModel(
      warehouseName: "Farm Fresh Warehouse",
      location: "Hassan",
      capacity: 600,
      occupied: 350,
    ),

  ];
}