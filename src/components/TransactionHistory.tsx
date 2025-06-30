import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, Filter, Download, RefreshCw, Activity } from 'lucide-react';
import { purchaseAPI } from '../services/api';
import { useAccount } from 'wagmi';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { formatEther } from 'viem';
import toast from 'react-hot-toast';

interface Transaction {
  _id: string;
  txHash: string;
  modelId: {
    _id: string;
    name: string;
    type: string;
    description: string;
    image?: string;
  };
  contractModelId: number;
  buyerAddress: string;
  sellerAddress: string;
  priceInETH: string;
  priceInUSD: number;
  platformFee: string;
  sellerAmount: string;
  blockNumber: number;
  network: string;
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  transactionType: 'database_model_purchase' | 'contract_model_purchase';
  confirmations: number;
  createdAt: string;
  confirmedAt?: string;
}

interface TransactionHistoryProps {
  address?: string;
  showFilters?: boolean;
  limit?: number;
  showBlockchainData?: boolean;
}

export default function TransactionHistory({ 
  address, 
  showFilters = true, 
  limit = 10,
  showBlockchainData = true
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    transactionType: '',
    status: '',
    network: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { address: connectedAddress } = useAccount();
  const displayAddress = address || connectedAddress;

  // Fetch blockchain data for real-time updates
  const { 
    stats: blockchainStats, 
    loading: blockchainLoading, 
    refetchAll: refetchBlockchainData 
  } = useBlockchainData();

  useEffect(() => {
    if (displayAddress) {
      loadTransactions();
    }
  }, [displayAddress, currentPage, filters]);

  // Auto-refresh blockchain data
  useEffect(() => {
    if (!autoRefresh || !showBlockchainData) return;

    const interval = setInterval(() => {
      refetchBlockchainData();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchBlockchainData, showBlockchainData]);

  const loadTransactions = async () => {
    if (!displayAddress) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit,
        address: displayAddress,
        ...filters
      };

      const response = await purchaseAPI.getTransactionHistory(params);
      
      if (response.success) {
        if (currentPage === 1) {
          setTransactions(response.data.docs || response.data);
        } else {
          setTransactions(prev => [...prev, ...(response.data.docs || response.data)]);
        }
        
        setHasMore((response.data.docs || response.data).length === limit);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Failed to load transactions');
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      transactionType: '',
      status: '',
      network: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const handleManualRefresh = async () => {
    await Promise.all([
      loadTransactions(),
      refetchBlockchainData()
    ]);
    setLastUpdate(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'reverted':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'reverted':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'database_model_purchase':
        return 'text-blue-600 bg-blue-100';
      case 'contract_model_purchase':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openBlockExplorer = (txHash: string, network: string) => {
    let url = '';
    switch (network) {
      case 'holesky':
        url = `https://holesky.etherscan.io/tx/${txHash}`;
        break;
      case 'ethereum':
        url = `https://etherscan.io/tx/${txHash}`;
        break;
      default:
        url = `https://etherscan.io/tx/${txHash}`;
    }
    window.open(url, '_blank');
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Transaction Hash', 'Model', 'Type', 'Price (ETH)', 'Status', 'Date', 'Network'],
      ...transactions.map(tx => [
        tx.txHash,
        tx.modelId?.name || 'Unknown',
        tx.transactionType,
        tx.priceInETH,
        tx.status,
        new Date(tx.createdAt).toLocaleDateString(),
        tx.network
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!displayAddress) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to view transaction history</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-600">View all your blockchain transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualRefresh}
            disabled={loading || blockchainLoading}
            className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading || blockchainLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {showBlockchainData && (
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 hover:bg-green-200 text-green-800' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
          )}
          
          <button
            onClick={exportTransactions}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Real-time status */}
      {showBlockchainData && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live blockchain data</span>
          </div>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      )}

      {/* Blockchain Stats Summary */}
      {showBlockchainData && blockchainStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="font-medium text-gray-900">Blockchain Transaction Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{blockchainStats.totalPurchases}</div>
              <div className="text-sm text-gray-600">Total Purchases</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{blockchainStats.totalSales}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {(blockchainStats.totalETHSpent || 0).toFixed(4)} ETH
              </div>
              <div className="text-sm text-gray-600">ETH Spent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {(blockchainStats.totalETHReceived || 0).toFixed(4)} ETH
              </div>
              <div className="text-sm text-gray-600">ETH Received</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="database_model_purchase">Database Model</option>
              <option value="contract_model_purchase">Contract Model</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="reverted">Reverted</option>
            </select>

            <select
              value={filters.network}
              onChange={(e) => handleFilterChange('network', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Networks</option>
              <option value="holesky">Holesky</option>
              <option value="ethereum">Ethereum</option>
              <option value="localhost">Localhost</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start Date"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End Date"
            />

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        {loading && currentPage === 1 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadTransactions}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <>
            {transactions.map((tx, index) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(tx.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(tx.transactionType)}`}>
                        {tx.transactionType === 'database_model_purchase' ? 'Database Model' : 'Contract Model'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Model</p>
                        <p className="font-medium text-gray-900">{tx.modelId?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium text-gray-900">{tx.priceInETH} ETH</p>
                        {tx.priceInUSD > 0 && (
                          <p className="text-xs text-gray-500">${tx.priceInUSD.toFixed(2)}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Network</p>
                        <p className="font-medium text-gray-900 capitalize">{tx.network}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">From:</span> {formatAddress(tx.buyerAddress)}
                      </div>
                      <div>
                        <span className="font-medium">To:</span> {formatAddress(tx.sellerAddress)}
                      </div>
                      <div>
                        <span className="font-medium">Block:</span> {tx.blockNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openBlockExplorer(tx.txHash, tx.network)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="View on Block Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 