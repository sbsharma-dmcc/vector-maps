import React from 'react';
import { Calendar } from 'lucide-react';

interface RouteTimelineProps {
  onDayClick: (dayIndex: number) => void;
  isAnimating: boolean;
}

const RouteTimeline: React.FC<RouteTimelineProps> = ({ onDayClick, isAnimating }) => {
  const timelineDays = [
    { day: 'Today', time: '11:50', weather: '⛅', temp: '24°C' },
    { day: 'Day 2', time: '11:50', weather: '☀️', temp: '26°C' },
    { day: 'Day 3', time: '11:50', weather: '🌧️', temp: '22°C' },
    { day: 'Day 4', time: '11:50', weather: '⛅', temp: '25°C' },
    { day: 'Day 5', time: '11:50', weather: '☀️', temp: '27°C' }
  ];

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[600px] z-10">
      <div className="flex items-center mb-3">
        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Route Timeline</h3>
        {isAnimating && (
          <span className="ml-2 text-sm text-blue-600 animate-pulse">Animating...</span>
        )}
      </div>
      
      <div className="flex items-center justify-between space-x-4">
        {timelineDays.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            onClick={() => onDayClick(index)}
          >
            <div className="text-xs text-gray-500 mb-1">{item.day}</div>
            <div className="w-3 h-3 bg-blue-500 rounded-full mb-2 hover:bg-blue-600 transition-colors"></div>
            <div className="text-xs font-medium text-gray-700">{item.time}</div>
            <div className="text-lg my-1">{item.weather}</div>
            <div className="text-xs text-gray-500">{item.temp}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        Click on any day to animate vessel position
      </div>
    </div>
  );
};

export default RouteTimeline;