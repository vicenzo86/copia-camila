import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          title: 'Falha no login',
          description: error.message || 'Email ou senha incorretos. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login bem-sucedido',
          description: 'Bem-vindo ao Constru-Leads!',
        });
        
        // Redirect to filter page after successful login
        navigate('/filter');
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <img src="/icons/logo.png" alt="Constru-Leads Logo" className="w-20 h-20 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Constru-Leads</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
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
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          className="pl-10" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground mb-2">
              Não tem uma conta? <Link to="/register" className="text-primary hover:underline">Cadastre-se</Link>
            </p>
            <p className="text-muted-foreground">
              <Link to="/forgot-password" className="text-primary hover:underline">Esqueceu sua senha?</Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Constru-Leads. Todos os direitos reservados.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
