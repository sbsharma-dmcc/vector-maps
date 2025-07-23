import React from 'react';

interface TimelineBarProps {
  onDayClick: (dayIndex: number) => void;
  isAnimating: boolean;
  currentDay?: number;
}

const TimelineBar: React.FC<TimelineBarProps> = ({ onDayClick, isAnimating, currentDay = 2 }) => {
  const timelineDays = [
    { day: '22', label: 'Tue', isToday: false },
    { day: '23', label: 'Wed', isToday: false },
    { day: 'Today', label: '', isToday: true },
    { day: '25', label: 'Fri', isToday: false },
    { day: '26', label: 'Sat', isToday: false }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm text-white z-20">
      <div className="flex items-center justify-center py-3">
        {timelineDays.map((item, index) => (
          <div 
            key={index}
            className={`
              px-4 py-2 mx-1 cursor-pointer transition-all duration-200 rounded-lg
              ${item.isToday 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'hover:bg-gray-700 text-gray-300'
              }
              ${index === currentDay ? 'ring-2 ring-blue-400' : ''}
            `}
            onClick={() => onDayClick(index)}
          >
            <div className="text-center">
              <div className="text-sm font-medium">
                {item.day}
              </div>
              {item.label && (
                <div className="text-xs opacity-75">
                  {item.label}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {isAnimating && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse"></div>
      )}
    </div>
  );
};

export default TimelineBar;