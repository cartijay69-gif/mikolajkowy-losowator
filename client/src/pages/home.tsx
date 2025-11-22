import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { CheckResultResponse } from "@shared/schema";
import { Gift, Sparkles, TreePine, AlertCircle, Snowflake, Share2, Users, Copy, Check } from "lucide-react";

// Confetti particle component
const Confetti = () => {
  const confetti = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${item.left}%`,
            top: "-10px",
            backgroundColor: Math.random() > 0.5 ? "hsl(355 78% 45%)" : "hsl(142 12% 90%)",
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Fetch participants list
  const { data: participants } = useQuery({
    queryKey: ["/api/participants"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/participants", undefined);
        return await response.json() as string[];
      } catch {
        return [];
      }
    },
  });

  const checkResultMutation = useMutation({
    mutationFn: async (nameToCheck: string) => {
      const response = await apiRequest(
        "POST",
        "/api/check-result",
        { name: nameToCheck }
      );
      return await response.json() as CheckResultResponse;
    },
    onSuccess: (data) => {
      setResult(data.drawsFor);
      setError(null);
      setShowResult(true);
      setShowConfetti(true);
      // Play celebration sound effect
      playSound();
      setTimeout(() => setShowConfetti(false), 3000);
    },
    onError: (err: any) => {
      setError(err.message || "Nie ma Cię na liście uczestników.");
      setResult(null);
      setShowResult(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Proszę wpisać swoje imię");
      setShowResult(true);
      return;
    }
    setShowResult(false);
    checkResultMutation.mutate(name.trim());
  };

  const handleShareResult = () => {
    if (result) {
      const text = `🎄 Mikołajkowy Losowator: Będę kupować prezent dla ${result}! 🎁`;
      navigator.clipboard.writeText(text);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  const playSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {
      // Audio not supported, silently fail
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      <div className="absolute inset-0 opacity-5 pointer-events-none text-primary hidden sm:block">
        <Snowflake className="absolute top-20 left-20 w-16 h-16 animate-pulse-subtle" />
        <Snowflake className="absolute top-40 right-32 w-14 h-14 animate-pulse-subtle" />
        <Snowflake className="absolute bottom-32 left-40 w-20 h-20 animate-pulse-subtle" />
        <Snowflake className="absolute bottom-20 right-20 w-16 h-16 animate-pulse-subtle" />
        <Sparkles className="absolute top-1/2 left-1/4 w-14 h-14 animate-pulse-subtle" />
        <Sparkles className="absolute top-1/3 right-1/4 w-14 h-14 animate-pulse-subtle" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Gift className="w-10 h-10 sm:w-14 sm:h-14 text-primary animate-bounce" />
            <TreePine className="w-12 h-12 sm:w-16 sm:h-16 text-accent-foreground" />
            <Gift className="w-10 h-10 sm:w-14 sm:h-14 text-primary animate-bounce" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-fredoka font-bold text-foreground leading-tight">
            Mikołajkowy Losowator
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            Sprawdź, kogo wylosowałeś w tym roku!
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-card-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name-input" className="text-sm font-medium text-foreground">
                Wpisz swoje imię
              </Label>
              <Input
                id="name-input"
                data-testid="input-name"
                type="text"
                placeholder="np. Janek, Kasia..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e as any)}
                className="h-12 sm:h-14 px-4 text-sm sm:text-base rounded-xl border-input focus-visible:ring-2 focus-visible:ring-ring transition-all shadow-sm focus:shadow-md"
                disabled={checkResultMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              data-testid="button-check-result"
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={checkResultMutation.isPending}
            >
              {checkResultMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Losowanie...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                  Sprawdź, kogo wylosowałeś!
                </span>
              )}
            </Button>
          </form>

          {/* Participants List */}
          <div className="border-t border-border pt-6">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
            >
              <Users className="w-4 h-4" />
              {showParticipants ? "Ukryj" : "Pokaż"} uczestników ({participants?.length || 0})
            </button>
            {showParticipants && participants && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                {participants.map((p) => (
                  <div
                    key={p}
                    className="px-3 py-2 rounded-lg bg-secondary/50 text-center text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          {showResult && result && (
            <div
              data-testid="result-success"
              className="animate-bounce-in rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-shimmer pointer-events-none" style={{backgroundSize: '200% 100%'}} />
              <div className="relative text-center space-y-4">
                <Gift className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary animate-float" />
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Cześć <span className="font-semibold text-foreground">{name}</span>!
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">
                    W tym roku kupujesz prezent dla:
                  </p>
                  <p className="text-2xl sm:text-3xl font-fredoka font-bold text-primary mt-3 sm:mt-4 animate-spin-in">
                    {result}
                  </p>
                </div>

                {/* Share Button */}
                <Button
                  onClick={handleShareResult}
                  variant="outline"
                  className="w-full mt-4 gap-2 sm:gap-3"
                >
                  {copiedResult ? (
                    <>
                      <Check className="w-4 h-4" />
                      Skopiowano!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Kopiuj wynik
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {showResult && error && (
            <div
              data-testid="result-error"
              className="animate-fade-in animate-shake rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20"
            >
              <div className="text-center space-y-3">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-destructive" />
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  {error}
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
          <TreePine className="w-3 h-3 sm:w-4 sm:h-4" />
          <p>Wesołych Świąt!</p>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      </div>
    </div>
  );
}
