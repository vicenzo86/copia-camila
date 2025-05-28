import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';

const RegisterConfirmation = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu Email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu email
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-6">
            <Mail className="h-24 w-24 text-muted-foreground opacity-20" />
          </div>
          <p className="mb-6 text-muted-foreground">
            Por favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
            Se não encontrar o email, verifique também sua pasta de spam.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/login">Voltar para Login</Link>
            </Button>
          </div>
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

export default RegisterConfirmation;
