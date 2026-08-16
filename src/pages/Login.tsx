import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { DiscIcon as DiscordIcon } from 'lucide-react';

export function LoginPage() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/discord';
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 px-4">
      <Card className="mx-auto max-w-sm border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">
            App Kanban
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Acesse o seu painel logando com o Discord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            onClick={handleLogin}
          >
            <DiscordIcon className="mr-2 h-4 w-4" />
            Entrar com Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
