import React from 'react';
import { Button } from '@/components/ui/button';
import { Ship } from 'lucide-react';
import { WaypointData } from '@/types/voyage';

interface GenerateVoyageButtonProps {
  waypoints: WaypointData[];
  voyageName: string;
  vesselName: string;
  onGenerate: () => void;
}

const GenerateVoyageButton = ({ 
  waypoints, 
  voyageName, 
  vesselName, 
  onGenerate 
}: GenerateVoyageButtonProps) => {
  const isDisabled = !voyageName || !vesselName || waypoints.length === 0;

  return (
    <div className="sticky bottom-0 bg-background border-t border-border p-4">
      <Button 
        onClick={onGenerate}
        className="w-full"
        disabled={isDisabled}
        size="lg"
      >
        <Ship className="w-4 h-4 mr-2" />
        Generate Voyage ({waypoints.length} waypoints)
      </Button>
      {isDisabled && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          {!voyageName || !vesselName 
            ? 'Please fill in voyage and vessel names' 
            : 'Please upload waypoints to generate voyage'
          }
        </div>
      )}
    </div>
  );
};

export default GenerateVoyageButton;