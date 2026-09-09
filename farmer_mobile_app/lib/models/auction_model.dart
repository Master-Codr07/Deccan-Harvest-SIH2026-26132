class AuctionModel {
  final String cropName;

  final String availableQuantity;

  final String village;

  // Farmer decides lot size
  final String lotSize;

  // Total lots calculated automatically
  final int totalLots;

  // Remaining lots available for purchase
  int availableLots;

  // Farmer's starting price per lot
  final double basePrice;

  // Current highest bid per lot
  double currentBid;

  // Lower circuit (15% below base price)
  final double lowerCircuit;

  final String auctionDate;

  final String auctionTime;

  // Pending, Live, Closed, Sold
  String status;

  // Auction end time
  DateTime? endTime;

  // Whether auction has ended
  bool isClosed;

  // Winning price after auction closes
  double finalPrice;
  
  // Highest bidder details
String? highestBidder;

String? highestBidderId;
// Winner Details
String? winnerName;
int purchasedLots = 0;


  AuctionModel({
    required this.cropName,
    required this.availableQuantity,
    required this.village,
    required this.lotSize,
    required this.totalLots,
    required this.availableLots,
    required this.basePrice,
    required this.currentBid,
    required this.lowerCircuit,
    required this.auctionDate,
    required this.auctionTime,
    required this.status,
    this.endTime,
    this.isClosed = false,
    this.finalPrice = 0,
    this.highestBidder,
this.highestBidderId,
this.winnerName,
this.purchasedLots = 0,
  });
}