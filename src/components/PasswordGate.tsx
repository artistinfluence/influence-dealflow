import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordGateProps {
  onLogin: () => void;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a brief loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'artistinfluence2025') {
      localStorage.setItem('artistInfluenceAuth', 'true');
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md center-content space-y-8">
        <div className="center-content space-y-4">
          <h1 className="text-6xl md:text-7xl font-bebas gradient-text tracking-wider">
            ARTIST INFLUENCE
          </h1>
          <h2 className="text-2xl md:text-3xl font-bebas text-muted-foreground tracking-wide">
            SALES PORTAL ACCESS
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="center-content space-y-6 w-full">
          <div className="w-full space-y-2">
            <Input
              type="password"
              placeholder="Enter portal password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg py-3 bg-card border-border focus:ring-primary"
              disabled={isLoading}
            />
            {error && (
              <p className="text-destructive text-center text-sm">
                {error}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-3 text-lg font-bebas tracking-wide bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            {isLoading ? 'ACCESSING PORTAL...' : 'ACCESS PORTAL'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;