import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { CheckResultResponse } from "@shared/schema";
import { Gift, Sparkles, TreePine, AlertCircle, Snowflake } from "lucide-react";

export default function Home() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none text-primary">
        <Snowflake className="absolute top-20 left-20 w-16 h-16" />
        <Snowflake className="absolute top-40 right-32 w-14 h-14" />
        <Snowflake className="absolute bottom-32 left-40 w-20 h-20" />
        <Snowflake className="absolute bottom-20 right-20 w-16 h-16" />
        <Sparkles className="absolute top-1/2 left-1/4 w-14 h-14" />
        <Sparkles className="absolute top-1/3 right-1/4 w-14 h-14" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center space-y-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-14 h-14 text-primary" />
            <TreePine className="w-16 h-16 text-accent-foreground" />
            <Gift className="w-14 h-14 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-foreground leading-tight">
            Mikołajkowy Losowator
          </h1>
          
          <p className="text-lg text-muted-foreground font-medium">
            Sprawdź, kogo wylosowałeś w tym roku!
          </p>
        </div>

        <Card className="p-8 space-y-6 shadow-xl border-card-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name-input" className="text-sm font-medium text-foreground">
                Wpisz swoje imię
              </Label>
              <Input
                id="name-input"
                data-testid="input-name"
                type="text"
                placeholder="np. Anna, Marek..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 px-4 text-base rounded-xl border-input focus-visible:ring-2 focus-visible:ring-ring transition-all shadow-sm focus:shadow-md"
                disabled={checkResultMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              data-testid="button-check-result"
              className="w-full h-14 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={checkResultMutation.isPending}
            >
              {checkResultMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Losowanie...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Sprawdź, kogo wylosowałeś!
                </span>
              )}
            </Button>
          </form>

          {showResult && result && (
            <div
              data-testid="result-success"
              className="animate-fade-in rounded-2xl p-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
            >
              <div className="text-center space-y-4">
                <Gift className="w-16 h-16 mx-auto text-primary animate-pulse-subtle" />
                <div className="space-y-2">
                  <p className="text-lg text-muted-foreground">
                    Cześć <span className="font-semibold text-foreground">{name}</span>!
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    W tym roku kupujesz prezent dla:
                  </p>
                  <p className="text-3xl font-fredoka font-bold text-primary mt-2">
                    {result}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showResult && error && (
            <div
              data-testid="result-error"
              className="animate-fade-in animate-shake rounded-2xl p-8 bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20"
            >
              <div className="text-center space-y-3">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                <p className="text-lg font-semibold text-foreground">
                  {error}
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <TreePine className="w-4 h-4" />
          <p>Wesołych Świąt!</p>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
