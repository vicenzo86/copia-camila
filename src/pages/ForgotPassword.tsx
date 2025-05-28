import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast({
          title: 'Erro',
          description: error.message || 'Não foi possível enviar o email de recuperação. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        setIsSubmitted(true);
        toast({
          title: 'Email enviado',
          description: 'Verifique seu email para redefinir sua senha.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar enviar o email de recuperação. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Email Enviado</CardTitle>
            <CardDescription>
              Verifique seu email para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <Mail className="h-24 w-24 text-muted-foreground opacity-20" />
            </div>
            <p className="mb-6 text-muted-foreground">
              Enviamos um link para redefinir sua senha para o email informado.
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
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
          <CardDescription>
            Informe seu email para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="seu@email.com" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Lembrou sua senha? <Link to="/login" className="text-primary hover:underline">Voltar para Login</Link>
            </p>
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

export default ForgotPassword;
