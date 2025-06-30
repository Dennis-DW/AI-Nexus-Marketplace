import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, X, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useBlockchainData } from '../hooks/useBlockchainData';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

interface TransactionNotificationProps {
  showNotifications?: boolean;
  maxNotifications?: number;
}

interface Notification {
  id: string;
  type: 'purchase' | 'sale' | 'balance_change' | 'error';
  title: string;
  message: string;
  amount?: string;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export default function TransactionNotification({ 
  showNotifications = true, 
  maxNotifications = 5 
}: TransactionNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [previousStats, setPreviousStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { stats: blockchainStats, loading: blockchainLoading } = useBlockchainData();

  // Monitor blockchain stats for changes
  useEffect(() => {
    if (!blockchainStats || !previousStats) {
      setPreviousStats(blockchainStats);
      return;
    }

    const newNotifications: Notification[] = [];

    // Check for new purchases
    if (blockchainStats.totalPurchases > previousStats.totalPurchases) {
      const newPurchases = blockchainStats.purchaseHistory?.slice(0, blockchainStats.totalPurchases - previousStats.totalPurchases) || [];
      
      newPurchases.forEach((purchase: any) => {
        newNotifications.push({
          id: `purchase-${purchase.txHash}-${Date.now()}`,
          type: 'purchase',
          title: 'Purchase Completed',
          message: `Successfully purchased model ${purchase.modelId || purchase.contractModelId}`,
          amount: `${parseFloat(formatEther(BigInt(purchase.price || '0'))).toFixed(4)} ETH`,
          timestamp: Date.now(),
          txHash: purchase.txHash,
          status: 'confirmed'
        });
      });
    }

    // Check for new sales
    if (blockchainStats.totalSales > previousStats.totalSales) {
      const newSales = blockchainStats.salesHistory?.slice(0, blockchainStats.totalSales - previousStats.totalSales) || [];
      
      newSales.forEach((sale: any) => {
        newNotifications.push({
          id: `sale-${sale.txHash}-${Date.now()}`,
          type: 'sale',
          title: 'Sale Completed',
          message: `Successfully sold model ${sale.modelId || sale.contractModelId}`,
          amount: `${parseFloat(formatEther(BigInt(sale.sellerAmount || '0'))).toFixed(4)} ETH`,
          timestamp: Date.now(),
          txHash: sale.txHash,
          status: 'confirmed'
        });
      });
    }

    // Check for significant balance changes
    const ethSpentChange = (blockchainStats.totalETHSpent || 0) - (previousStats.totalETHSpent || 0);
    const ethReceivedChange = (blockchainStats.totalETHReceived || 0) - (previousStats.totalETHReceived || 0);

    if (Math.abs(ethSpentChange) > 0.001) {
      newNotifications.push({
        id: `balance-spent-${Date.now()}`,
        type: 'balance_change',
        title: 'ETH Balance Update',
        message: ethSpentChange > 0 ? 'ETH spent on purchases' : 'ETH refunded',
        amount: `${Math.abs(ethSpentChange).toFixed(4)} ETH`,
        timestamp: Date.now(),
        status: 'confirmed'
      });
    }

    if (Math.abs(ethReceivedChange) > 0.001) {
      newNotifications.push({
        id: `balance-received-${Date.now()}`,
        type: 'balance_change',
        title: 'ETH Received',
        message: 'ETH received from sales',
        amount: `${ethReceivedChange.toFixed(4)} ETH`,
        timestamp: Date.now(),
        status: 'confirmed'
      });
    }

    // Add new notifications
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, maxNotifications));
      setIsVisible(true);
    }

    setPreviousStats(blockchainStats);
  }, [blockchainStats, previousStats, maxNotifications]);

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string, status: string) => {
    if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
    if (status === 'pending') return <Clock className="h-5 w-5 text-yellow-500" />;
    
    switch (type) {
      case 'purchase':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      case 'sale':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'balance_change':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'border-green-200 bg-green-50';
      case 'sale':
        return 'border-blue-200 bg-blue-50';
      case 'balance_change':
        return 'border-purple-200 bg-purple-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!isConnected || !showNotifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {isVisible && notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`max-w-sm w-full p-4 rounded-lg border shadow-lg ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type, notification.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                
                {notification.amount && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-900">
                      {notification.amount}
                    </span>
                  </div>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {notification.txHash && (
                    <button
                      onClick={() => {
                        const url = `https://holesky.etherscan.io/tx/${notification.txHash}`;
                        window.open(url, '_blank');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View on Etherscan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 