'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GameConfig, PlayerType } from '@memory/game-logic';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [matchSize, setMatchSize] = useState<2 | 3 | 4>(2);
  const [numRanks, setNumRanks] = useState<13 | 26>(13);
  const [numPlayers, setNumPlayers] = useState(2);
  const [aiPlayers, setAiPlayers] = useState(1);

  const handleStartGame = () => {
    const players = [];

    // Add human players
    for (let i = 0; i < numPlayers - aiPlayers; i++) {
      players.push({
        index: i,
        name: `Player ${i + 1}`,
        type: PlayerType.Human,
      });
    }

    // Add AI players
    for (let i = numPlayers - aiPlayers; i < numPlayers; i++) {
      players.push({
        index: i,
        name: `AI ${i - (numPlayers - aiPlayers) + 1}`,
        type: PlayerType.AI,
      });
    }

    const config: GameConfig = {
      matchSize,
      numRanks,
      numPlayers,
      players,
    };

    onStartGame(config);
  };

  const totalCards = numRanks * matchSize;
  const totalPairs = numRanks;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Memory Game Setup</CardTitle>
          <CardDescription>Configure your game settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Match Size</label>
            <Select
              value={String(matchSize)}
              onValueChange={(v) => setMatchSize(Number(v) as 2 | 3 | 4)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Pairs (2 cards)</SelectItem>
                <SelectItem value="3">Triplets (3 cards)</SelectItem>
                <SelectItem value="4">Quadruplets (4 cards)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">How many matching cards to find</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={String(numRanks)}
              onValueChange={(v) => setNumRanks(Number(v) as 13 | 26)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="13">Standard (13 ranks)</SelectItem>
                <SelectItem value="26">Hard (26 ranks)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Total cards: {totalCards} ({totalPairs} matches)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Players</label>
            <Select
              value={String(numPlayers)}
              onValueChange={(v) => {
                const newNumPlayers = Number(v);
                setNumPlayers(newNumPlayers);
                // Adjust AI players if needed
                if (aiPlayers > newNumPlayers) {
                  setAiPlayers(newNumPlayers);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Players</SelectItem>
                <SelectItem value="3">3 Players</SelectItem>
                <SelectItem value="4">4 Players</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">AI Players</label>
            <Select value={String(aiPlayers)} onValueChange={(v) => setAiPlayers(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: numPlayers + 1 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {i} AI Player{i !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {numPlayers - aiPlayers} human, {aiPlayers} AI
            </p>
          </div>

          <Button onClick={handleStartGame} className="w-full" size="lg">
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
