import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Warning {
  id: string;
  waypointName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  type: 'weather' | 'route' | 'safety';
}

interface WarningsPanelProps {
  warnings: Warning[];
  position?: 'floating' | 'sidebar';
  onClose?: () => void;
  className?: string;
}

const WarningsPanel = ({ warnings, position = 'floating', onClose, className = '' }: WarningsPanelProps) => {
  if (warnings.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return <AlertTriangle className={`w-4 h-4 ${
      severity === 'high' ? 'text-red-500' : 
      severity === 'medium' ? 'text-orange-500' : 
      'text-yellow-500'
    }`} />;
  };

  const baseClasses = position === 'floating' 
    ? "absolute top-4 right-4 z-50 w-80 shadow-lg animate-pulse" 
    : "w-full";

  return (
    <Card className={`${baseClasses} ${className} border-orange-200 bg-orange-50/95 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Route Warnings ({warnings.length})
          </CardTitle>
          {position === 'floating' && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {warnings.map((warning) => (
            <div 
              key={warning.id}
              className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-orange-200"
            >
              <div className="flex-shrink-0">
                {getSeverityIcon(warning.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{warning.waypointName}</span>
                  <Badge 
                    variant={getSeverityColor(warning.severity)}
                    className="text-xs"
                  >
                    {warning.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {warning.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WarningsPanel;