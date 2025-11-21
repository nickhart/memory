import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Card Games</h1>
        <p className="text-muted-foreground">Choose a game to play</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link href="/memory" className="transition-transform hover:scale-105">
          <Card className="h-full cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <CardTitle>Memory Game</CardTitle>
              <CardDescription>Match pairs of cards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Test your memory by matching cards with the same rank. Play against AI or with
                friends!
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  1-4 Players
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                  AI Available
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/blackjack" className="transition-transform hover:scale-105">
          <Card className="h-full cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <CardTitle>Blackjack</CardTitle>
              <CardDescription>Beat the dealer to 21</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Classic blackjack game. Try to get as close to 21 as possible without going over!
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                  Single Player
                </span>
                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                  Coming Soon
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/hearts" className="transition-transform hover:scale-105">
          <Card className="h-full cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <CardTitle>Hearts</CardTitle>
              <CardDescription>Avoid hearts and the Queen of Spades</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Classic trick-taking game. Try to avoid penalty cards or shoot the moon!
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                  4 Players
                </span>
                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                  Coming Soon
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
