class PurchaseModel {
  final String cropName;
  final String buyerName;

  // Winning price per lot
  final double pricePerLot;

  // Number of lots selected by buyer
  final int lotsPurchased;

  // Lot price × lots
  final double totalAmount;

  // Payment status
  String status;

  PurchaseModel({
    required this.cropName,
    required this.buyerName,
    required this.pricePerLot,
    required this.lotsPurchased,
    required this.totalAmount,
    required this.status,
  });
}