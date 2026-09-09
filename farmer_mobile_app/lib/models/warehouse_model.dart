class WarehouseModel {
  final String warehouseName;
  final String location;
  final int capacity;
  int occupied;

  WarehouseModel({
    required this.warehouseName,
    required this.location,
    required this.capacity,
    required this.occupied,
  });

  int get availableSpace => capacity - occupied;
}