import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Processar o callback de autenticação
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else {
          // Redirecionar para a página principal após confirmação bem-sucedida
          setTimeout(() => {
            navigate('/filter');
          }, 2000);
        }
      } catch (err) {
        setError('Ocorreu um erro ao processar a autenticação.');
        console.error('Auth callback error:', err);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Processando Autenticação</CardTitle>
            <CardDescription>
              Por favor, aguarde enquanto confirmamos sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Erro de Autenticação</CardTitle>
            <CardDescription>
              Ocorreu um problema ao confirmar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button asChild>
              <a href="/login">Voltar para Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-green-600">Autenticação Confirmada</CardTitle>
          <CardDescription>
            Sua conta foi confirmada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            Você será redirecionado automaticamente em instantes...
          </p>
          <Button asChild>
            <a href="/filter">Ir para a Aplicação</a>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Obra Alerta Maps. Todos os direitos reservados.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthCallback;
