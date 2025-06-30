import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MARKETPLACE_ADDRESS } from '../config/contracts';

export interface BlockchainModel {
  id: number;
  name: string;
  modelType: string;
  description: string;
  price: string;
  seller: string;
  sold: boolean;
  active: boolean;
  createdAt: number;
  totalSales: number;
  isBlockchainModel: true;
}

export function useBlockchainModels() {
  const [models, setModels] = useState<BlockchainModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlockchainModels() {
      try {
        setLoading(true);
        setError(null);

        // Check if MetaMask is available
        if (typeof window.ethereum === 'undefined') {
          setError('MetaMask is not installed');
          setLoading(false);
          return;
        }

        // Create provider and contract instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          MARKETPLACE_ADDRESS,
          [
            'function getModels() public view returns (tuple(uint256 id, string name, string modelType, string description, uint256 price, address seller, bool sold, bool active, uint256 createdAt, uint256 totalSales)[])',
            'function getTotalModels() public view returns (uint256)'
          ],
          provider
        );

        // Fetch all models from blockchain
        const blockchainModels = await contract.getModels();
        
        // Transform the data
        const transformedModels: BlockchainModel[] = blockchainModels.map((model: any) => ({
          id: Number(model.id),
          name: model.name,
          modelType: model.modelType,
          description: model.description,
          price: ethers.formatEther(model.price.toString()),
          seller: model.seller,
          sold: model.sold,
          active: model.active,
          createdAt: Number(model.createdAt),
          totalSales: Number(model.totalSales),
          isBlockchainModel: true
        }));

        setModels(transformedModels);
      } catch (err) {
        console.error('Error fetching blockchain models:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch blockchain models');
      } finally {
        setLoading(false);
      }
    }

    fetchBlockchainModels();
  }, []);

  return { models, loading, error };
} 