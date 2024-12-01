import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaNewspaper } from 'react-icons/fa';
import { createChart } from 'lightweight-charts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getStockChart } from '../services/api/alphaVantage';
import { getStockNews } from '../services/api/marketaux';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  lastPrice: number;
  change: number;
}

interface StockDetailsModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
}

const timeRanges = [
  { label: '1J', value: '1d' },
  { label: '1S', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1A', value: '1y' },
  { label: '5A', value: '5y' }
];

const StockDetailsModal: React.FC<StockDetailsModalProps> = ({ stock, isOpen, onClose }) => {
  const [selectedRange, setSelectedRange] = useState('1m');
  const [chartData, setChartData] = useState<any[]>([]);
  const [details, setDetails] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [chartResponse, newsData] = await Promise.all([
          getStockChart(stock.symbol, selectedRange),
          getStockNews(stock.symbol)
        ]);
        setDetails(chartResponse);
        setNews(newsData);
        setChartData(chartResponse.historicalData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [stock.symbol, selectedRange, isOpen]);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#4CAF50',
      downColor: '#FF5252',
      borderVisible: false,
      wickUpColor: '#4CAF50',
      wickDownColor: '#FF5252'
    });

    candlestickSeries.setData(chartData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Rest of the modal content remains the same */}
        </div>
      </div>
    </Dialog>
  );
};

export default StockDetailsModal;