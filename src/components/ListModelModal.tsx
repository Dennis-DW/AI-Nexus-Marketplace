import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, Loader } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { modelAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ListModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelListed: () => void;
}

export default function ListModelModal({ isOpen, onClose, onModelListed }: ListModelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'NLP',
    description: '',
    price: '',
    tags: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [listingMode, setListingMode] = useState<'both' | 'backend' | 'contract'>('both');

  const { address } = useAccount();
  const { listNewModel, isListingModel } = useContract();

  const modelTypes = ['NLP', 'Computer Vision', 'Audio', 'Generative', 'Prediction', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Generate a valid 64-character hex string for fileHash (demo)
      const fileHash = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);

      if (listingMode === 'contract' || listingMode === 'both') {
        // List on smart contract
        await listNewModel(
          formData.name,
          formData.type,
          formData.description,
          formData.price
        );
        toast.success('Model listed on blockchain!');
      }

      if (listingMode === 'backend' || listingMode === 'both') {
        // Add to backend database
        await modelAPI.addModel({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          price: formData.price,
          fileHash,
          sellerAddress: address,
          tags,
          category: formData.type,
        });
        toast.success('Model added to database!');
      }

      // Reset form
      setFormData({
        name: '',
        type: 'NLP',
        description: '',
        price: '',
        tags: '',
      });

      onModelListed();
    } catch (error: any) {
      console.error('Error listing model:', error);
      toast.error(error.message || 'Failed to list model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-zinc-800 mb-4 flex items-center justify-between">
                  List New AI Model
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Listing Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Listing Mode
                    </label>
                    <select
                      value={listingMode}
                      onChange={(e) => setListingMode(e.target.value as any)}
                      className="w-full glass rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="both" className="bg-slate-300">Both (Recommended)</option>
                      <option value="backend" className="bg-slate-300">Database Only</option>
                      <option value="contract" className="bg-slate-300">Blockchain Only</option>
                    </select>
                  </div>

                  {/* Model Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Model Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Advanced Language Model"
                      className="w-full glass rounded-lg px-3 py-2  text-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Model Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Model Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full glass rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {modelTypes.map(type => (
                        <option key={type} value={type} className="bg-slate-300">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your AI model's capabilities and use cases..."
                      rows={3}
                      className="w-full glass rounded-lg px-3 py-2 text-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Price (ETH) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.1"
                      step="0.001"
                      min="0"
                      className="w-full glass rounded-lg px-3 py-2 text-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="machine learning, nlp, transformer"
                      className="w-full glass rounded-lg px-3 py-2 text-zinc-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || isListingModel}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      {isLoading || isListingModel ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Listing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>List Model</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}