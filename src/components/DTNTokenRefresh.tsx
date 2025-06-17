
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getDTNToken } from '@/utils/dtnTokenManager';

const DTNTokenRefresh: React.FC = () => {
  const { toast } = useToast();

  const handleRefresh = () => {
    const currentToken = getDTNToken();
    if (currentToken) {
      toast({
        title: "Token Status",
        description: "DTN token is currently set"
      });
    } else {
      toast({
        title: "No Token",
        description: "Please set a DTN token first",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={handleRefresh} variant="outline" size="sm">
      Check Token
    </Button>
  );
};

export default DTNTokenRefresh;
