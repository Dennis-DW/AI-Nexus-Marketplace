// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AINexusMarketplace
 * @dev A decentralized marketplace for AI models with secure transactions
 */
contract AINexusMarketplace is Ownable, ReentrancyGuard, Pausable {
    
    // Model structure
    struct Model {
        uint256 id;
        string name;
        string modelType;
        string description;
        uint256 price;
        address payable seller;
        bool sold;
        bool active;
        uint256 createdAt;
        uint256 totalSales;
    }
    
    // Database Model Purchase structure
    struct DatabaseModelPurchase {
        string modelId;           // MongoDB ObjectId
        uint256 contractModelId;  // Optional contract model ID
        address buyer;
        address payable seller;
        uint256 price;
        uint256 platformFee;
        uint256 sellerAmount;
        uint256 blockNumber;
        uint256 timestamp;
        string txHash;
        bool isDatabaseModel;
    }
    
    // State variables
    uint256 private _modelIdCounter;
    uint256 public platformFeePercentage = 250; // 2.5% (250 basis points)
    uint256 public constant MAX_FEE_PERCENTAGE = 1000; // 10% maximum
    
    // Mappings
    mapping(uint256 => Model) public models;
    mapping(address => uint256[]) public sellerModels;
    mapping(address => uint256[]) public buyerPurchases;
    mapping(uint256 => address[]) public modelBuyers;
    
    // Database model purchase tracking
    mapping(string => DatabaseModelPurchase[]) public databaseModelPurchases;
    mapping(address => DatabaseModelPurchase[]) public userPurchases;
    mapping(address => DatabaseModelPurchase[]) public userSales;
    mapping(string => uint256) public modelPurchaseCount; // Track purchases per model
    
    // Track user balances and prevent double spending
    mapping(address => uint256) public userBalances;
    mapping(address => mapping(uint256 => bool)) public hasPurchasedModel; // user => modelId => hasPurchased
    mapping(address => mapping(string => bool)) public hasPurchasedDatabaseModel; // user => modelId => hasPurchased
    
    IERC20 public paymentToken;
    
    // Events
    event ModelListed(
        uint256 indexed modelId,
        string name,
        string modelType,
        uint256 price,
        address indexed seller
    );
    
    event ModelPurchased(
        uint256 indexed modelId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee
    );
    
    event DatabaseModelPurchased(
        string indexed modelId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee,
        string txHash,
        uint256 blockNumber
    );
    
    event ModelUpdated(
        uint256 indexed modelId,
        string name,
        string description,
        uint256 price
    );
    
    event ModelDeactivated(uint256 indexed modelId);
    event ModelReactivated(uint256 indexed modelId);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event UserBalanceUpdated(address indexed user, uint256 oldBalance, uint256 newBalance);
    event PaymentTokenUpdated(address indexed newToken);
    
    // Modifiers
    modifier validModelId(uint256 _modelId) {
        require(_modelId > 0 && _modelId <= _modelIdCounter, "Invalid model ID");
        _;
    }
    
    modifier onlyModelSeller(uint256 _modelId) {
        require(models[_modelId].seller == msg.sender, "Not the model seller");
        _;
    }
    
    modifier modelExists(uint256 _modelId) {
        require(models[_modelId].id != 0, "Model does not exist");
        _;
    }
    
    modifier modelActive(uint256 _modelId) {
        require(models[_modelId].active, "Model is not active");
        _;
    }
    
    modifier notSelfPurchase(address _seller) {
        require(msg.sender != _seller, "Cannot buy your own model");
        _;
    }
    
    modifier sufficientBalance(uint256 _amount) {
        require(msg.value >= _amount, "Insufficient ETH sent");
        _;
    }
    
    modifier notAlreadyPurchased(uint256 _modelId) {
        require(!hasPurchasedModel[msg.sender][_modelId], "Already purchased this model");
        _;
    }
    
    modifier notAlreadyPurchasedDatabase(string calldata _modelId) {
        require(!hasPurchasedDatabaseModel[msg.sender][_modelId], "Already purchased this model");
        _;
    }
    
    constructor() {
        _modelIdCounter = 0;
    }
    
    /**
     * @dev List a new AI model for sale
     * @param _name Name of the AI model
     * @param _modelType Type/category of the model
     * @param _description Description of the model
     * @param _price Price in wei
     */
    function listModel(
        string calldata _name,
        string calldata _modelType,
        string calldata _description,
        uint256 _price
    ) external whenNotPaused {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_modelType).length > 0, "Model type cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        _modelIdCounter++;
        uint256 newModelId = _modelIdCounter;
        
        models[newModelId] = Model({
            id: newModelId,
            name: _name,
            modelType: _modelType,
            description: _description,
            price: _price,
            seller: payable(msg.sender),
            sold: false,
            active: true,
            createdAt: block.timestamp,
            totalSales: 0
        });
        
        sellerModels[msg.sender].push(newModelId);
        
        emit ModelListed(newModelId, _name, _modelType, _price, msg.sender);
    }
    
    /**
     * @dev Purchase an AI model from the blockchain
     * @param _modelId ID of the model to purchase
     */
    function buyModel(uint256 _modelId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validModelId(_modelId)
        modelExists(_modelId)
        modelActive(_modelId)
        notSelfPurchase(models[_modelId].seller)
        sufficientBalance(models[_modelId].price)
        notAlreadyPurchased(_modelId)
    {
        Model storage model = models[_modelId];
        
        // Mark as purchased to prevent double spending
        hasPurchasedModel[msg.sender][_modelId] = true;
        
        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 sellerAmount = msg.value - platformFee;
        
        // Update model data
        model.totalSales++;
        modelBuyers[_modelId].push(msg.sender);
        buyerPurchases[msg.sender].push(_modelId);
        
        // Transfer funds
        model.seller.transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > model.price) {
            payable(msg.sender).transfer(msg.value - model.price);
        }
        
        emit ModelPurchased(_modelId, msg.sender, model.seller, model.price, platformFee);
    }
    
    /**
     * @dev Purchase a database model with direct ETH transfer to seller
     * @param _modelId MongoDB ObjectId of the model
     * @param _sellerAddress Address of the model seller
     * @param _price Price in wei
     * @param _contractModelId Optional contract model ID (0 if not applicable)
     */
    function buyDatabaseModel(
        string calldata _modelId,
        address payable _sellerAddress,
        uint256 _price,
        uint256 _contractModelId
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        notSelfPurchase(_sellerAddress)
        sufficientBalance(_price)
        notAlreadyPurchasedDatabase(_modelId)
    {
        require(bytes(_modelId).length > 0, "Model ID cannot be empty");
        require(_sellerAddress != address(0), "Invalid seller address");
        require(_price > 0, "Price must be greater than 0");
        
        // Mark as purchased to prevent double spending
        hasPurchasedDatabaseModel[msg.sender][_modelId] = true;
        
        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        uint256 sellerAmount = msg.value - platformFee;
        
        // Create purchase record
        DatabaseModelPurchase memory purchase = DatabaseModelPurchase({
            modelId: _modelId,
            contractModelId: _contractModelId,
            buyer: msg.sender,
            seller: _sellerAddress,
            price: _price,
            platformFee: platformFee,
            sellerAmount: sellerAmount,
            blockNumber: block.number,
            timestamp: block.timestamp,
            txHash: "", // Will be set by frontend
            isDatabaseModel: true
        });
        
        // Store purchase records
        databaseModelPurchases[_modelId].push(purchase);
        userPurchases[msg.sender].push(purchase);
        userSales[_sellerAddress].push(purchase);
        modelPurchaseCount[_modelId]++;
        
        // Transfer funds directly to seller
        _sellerAddress.transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > _price) {
            payable(msg.sender).transfer(msg.value - _price);
        }
        
        emit DatabaseModelPurchased(
            _modelId,
            msg.sender,
            _sellerAddress,
            _price,
            platformFee,
            "", // txHash will be set by frontend
            block.number
        );
    }
    
    /**
     * @dev Update transaction hash for a database model purchase
     * @param _modelId MongoDB ObjectId of the model
     * @param _purchaseIndex Index of the purchase in the array
     * @param _txHash Transaction hash
     */
    function updatePurchaseTxHash(
        string calldata _modelId,
        uint256 _purchaseIndex,
        string calldata _txHash
    ) external {
        require(bytes(_modelId).length > 0, "Model ID cannot be empty");
        require(bytes(_txHash).length > 0, "Transaction hash cannot be empty");
        require(_purchaseIndex < databaseModelPurchases[_modelId].length, "Invalid purchase index");
        
        DatabaseModelPurchase storage purchase = databaseModelPurchases[_modelId][_purchaseIndex];
        require(purchase.buyer == msg.sender, "Only buyer can update tx hash");
        
        purchase.txHash = _txHash;
    }
    
    /**
     * @dev Get all purchases for a specific database model
     * @param _modelId MongoDB ObjectId of the model
     * @return Array of purchase records
     */
    function getDatabaseModelPurchases(string calldata _modelId) 
        external 
        view 
        returns (DatabaseModelPurchase[] memory) 
    {
        return databaseModelPurchases[_modelId];
    }
    
    /**
     * @dev Get all purchases made by a user
     * @param _userAddress Address of the user
     * @return Array of purchase records
     */
    function getUserPurchases(address _userAddress) 
        external 
        view 
        returns (DatabaseModelPurchase[] memory) 
    {
        return userPurchases[_userAddress];
    }
    
    /**
     * @dev Get all sales made by a user
     * @param _userAddress Address of the user
     * @return Array of purchase records
     */
    function getUserSales(address _userAddress) 
        external 
        view 
        returns (DatabaseModelPurchase[] memory) 
    {
        return userSales[_userAddress];
    }
    
    /**
     * @dev Get purchase count for a specific model
     * @param _modelId MongoDB ObjectId of the model
     * @return Number of purchases
     */
    function getModelPurchaseCount(string calldata _modelId) 
        external 
        view 
        returns (uint256) 
    {
        return modelPurchaseCount[_modelId];
    }
    
    /**
     * @dev Update model details (only by seller)
     * @param _modelId ID of the model to update
     * @param _name New name
     * @param _description New description
     * @param _price New price
     */
    function updateModel(
        uint256 _modelId,
        string calldata _name,
        string calldata _description,
        uint256 _price
    ) 
        external 
        validModelId(_modelId)
        modelExists(_modelId)
        onlyModelSeller(_modelId)
    {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        Model storage model = models[_modelId];
        model.name = _name;
        model.description = _description;
        model.price = _price;
        
        emit ModelUpdated(_modelId, _name, _description, _price);
    }
    
    /**
     * @dev Deactivate a model (only by seller)
     * @param _modelId ID of the model to deactivate
     */
    function deactivateModel(uint256 _modelId) 
        external 
        validModelId(_modelId)
        modelExists(_modelId)
        onlyModelSeller(_modelId)
    {
        models[_modelId].active = false;
        emit ModelDeactivated(_modelId);
    }
    
    /**
     * @dev Reactivate a model (only by seller)
     * @param _modelId ID of the model to reactivate
     */
    function reactivateModel(uint256 _modelId) 
        external 
        validModelId(_modelId)
        modelExists(_modelId)
        onlyModelSeller(_modelId)
    {
        models[_modelId].active = true;
        emit ModelReactivated(_modelId);
    }
    
    /**
     * @dev Get all active models
     * @return Array of all active models
     */
    function getModels() public view returns (Model[] memory) {
        uint256 activeCount = 0;
        
        // Count active models
        for (uint256 i = 1; i <= _modelIdCounter; i++) {
            if (models[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active models
        Model[] memory activeModels = new Model[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _modelIdCounter; i++) {
            if (models[i].active) {
                activeModels[currentIndex] = models[i];
                currentIndex++;
            }
        }
        
        return activeModels;
    }
    
    /**
     * @dev Get models by seller
     * @param _seller Address of the seller
     * @return Array of model IDs owned by the seller
     */
    function getModelsBySeller(address _seller) public view returns (uint256[] memory) {
        return sellerModels[_seller];
    }
    
    /**
     * @dev Get purchases by buyer
     * @param _buyer Address of the buyer
     * @return Array of model IDs purchased by the buyer
     */
    function getPurchasesByBuyer(address _buyer) public view returns (uint256[] memory) {
        return buyerPurchases[_buyer];
    }
    
    /**
     * @dev Get buyers of a specific model
     * @param _modelId ID of the model
     * @return Array of buyer addresses
     */
    function getModelBuyers(uint256 _modelId) public view returns (address[] memory) {
        return modelBuyers[_modelId];
    }
    
    /**
     * @dev Check if a user owns a specific model
     * @param _user Address of the user
     * @param _modelId ID of the model
     * @return True if user owns the model
     */
    function ownsModel(address _user, uint256 _modelId) public view returns (bool) {
        address[] memory buyers = modelBuyers[_modelId];
        for (uint256 i = 0; i < buyers.length; i++) {
            if (buyers[i] == _user) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get total number of models
     * @return Total model count
     */
    function getTotalModels() public view returns (uint256) {
        return _modelIdCounter;
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param _newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= MAX_FEE_PERCENTAGE, "Fee too high");
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _newFeePercentage;
        emit PlatformFeeUpdated(oldFee, _newFeePercentage);
    }
    
    /**
     * @dev Withdraw accumulated platform fees (only owner)
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Emergency function to recover stuck tokens (if any ERC20 tokens are sent by mistake)
    function emergencyWithdrawToken(address _token, uint256 _amount) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        // This would require importing IERC20 interface
        // IERC20(_token).transfer(owner(), _amount);
    }
    
    /**
     * @dev Check if a user has purchased a specific model
     * @param _user Address of the user
     * @param _modelId ID of the model
     * @return True if user has purchased the model
     */
    function hasUserPurchasedModel(address _user, uint256 _modelId) public view returns (bool) {
        return hasPurchasedModel[_user][_modelId];
    }
    
    /**
     * @dev Check if a user has purchased a specific database model
     * @param _user Address of the user
     * @param _modelId MongoDB ObjectId of the model
     * @return True if user has purchased the model
     */
    function hasUserPurchasedDatabaseModel(address _user, string calldata _modelId) public view returns (bool) {
        return hasPurchasedDatabaseModel[_user][_modelId];
    }
    
    /**
     * @dev Get user's purchase count for contract models
     * @param _user Address of the user
     * @return Number of models purchased
     */
    function getUserContractModelPurchaseCount(address _user) public view returns (uint256) {
        return buyerPurchases[_user].length;
    }
    
    /**
     * @dev Get user's purchase count for database models
     * @param _user Address of the user
     * @return Number of database models purchased
     */
    function getUserDatabaseModelPurchaseCount(address _user) public view returns (uint256) {
        return userPurchases[_user].length;
    }
    
    /**
     * @dev Get total purchase count for a user (both contract and database models)
     * @param _user Address of the user
     * @return Total number of purchases
     */
    function getUserTotalPurchaseCount(address _user) public view returns (uint256) {
        return buyerPurchases[_user].length + userPurchases[_user].length;
    }
    
    function setPaymentToken(address _token) external onlyOwner {
        paymentToken = IERC20(_token);
        emit PaymentTokenUpdated(_token);
    }
    
    // Buy model with ERC20 token
    function buyModelWithToken(uint256 _modelId) 
        external 
        nonReentrant 
        whenNotPaused 
        validModelId(_modelId)
        modelExists(_modelId)
        modelActive(_modelId)
        notSelfPurchase(models[_modelId].seller)
        notAlreadyPurchased(_modelId)
    {
        Model storage model = models[_modelId];
        require(paymentToken != IERC20(address(0)), "Payment token not set");
        require(paymentToken.allowance(msg.sender, address(this)) >= model.price, "Insufficient allowance");
        require(paymentToken.balanceOf(msg.sender) >= model.price, "Insufficient token balance");
        
        // Mark as purchased to prevent double spending
        hasPurchasedModel[msg.sender][_modelId] = true;
        
        // Calculate platform fee
        uint256 platformFee = (model.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = model.price - platformFee;
        
        // Update model data
        model.totalSales++;
        modelBuyers[_modelId].push(msg.sender);
        buyerPurchases[msg.sender].push(_modelId);
        
        // Transfer tokens from buyer to seller (sellerAmount)
        require(paymentToken.transferFrom(msg.sender, model.seller, sellerAmount), "Token transfer to seller failed");
        
        // Transfer platform fee to contract owner
        if (platformFee > 0) {
            require(paymentToken.transferFrom(msg.sender, owner(), platformFee), "Token transfer for platform fee failed");
        }
        
        emit ModelPurchased(_modelId, msg.sender, model.seller, model.price, platformFee);
    }

    // Buy database model with ERC20 token
    function buyDatabaseModelWithToken(
        string calldata _modelId, 
        address payable _sellerAddress, 
        uint256 _price, 
        uint256 _contractModelId
    ) 
        external 
        nonReentrant 
        whenNotPaused 
        notSelfPurchase(_sellerAddress)
        notAlreadyPurchasedDatabase(_modelId)
    {
        require(bytes(_modelId).length > 0, "Model ID cannot be empty");
        require(_sellerAddress != address(0), "Invalid seller address");
        require(_price > 0, "Price must be greater than 0");
        require(paymentToken != IERC20(address(0)), "Payment token not set");
        require(paymentToken.allowance(msg.sender, address(this)) >= _price, "Insufficient allowance");
        require(paymentToken.balanceOf(msg.sender) >= _price, "Insufficient token balance");
        
        // Mark as purchased to prevent double spending
        hasPurchasedDatabaseModel[msg.sender][_modelId] = true;
        
        // Calculate platform fee
        uint256 platformFee = (_price * platformFeePercentage) / 10000;
        uint256 sellerAmount = _price - platformFee;
        
        // Create purchase record
        DatabaseModelPurchase memory purchase = DatabaseModelPurchase({
            modelId: _modelId,
            contractModelId: _contractModelId,
            buyer: msg.sender,
            seller: _sellerAddress,
            price: _price,
            platformFee: platformFee,
            sellerAmount: sellerAmount,
            blockNumber: block.number,
            timestamp: block.timestamp,
            txHash: "", // Will be set by frontend
            isDatabaseModel: true
        });
        
        // Store purchase records
        databaseModelPurchases[_modelId].push(purchase);
        userPurchases[msg.sender].push(purchase);
        userSales[_sellerAddress].push(purchase);
        modelPurchaseCount[_modelId]++;
        
        // Transfer tokens from buyer to seller (sellerAmount)
        require(paymentToken.transferFrom(msg.sender, _sellerAddress, sellerAmount), "Token transfer to seller failed");
        
        // Transfer platform fee to contract owner
        if (platformFee > 0) {
            require(paymentToken.transferFrom(msg.sender, owner(), platformFee), "Token transfer for platform fee failed");
        }
        
        emit DatabaseModelPurchased(
            _modelId,
            msg.sender,
            _sellerAddress,
            _price,
            platformFee,
            "", // txHash will be set by frontend
            block.number
        );
    }
}