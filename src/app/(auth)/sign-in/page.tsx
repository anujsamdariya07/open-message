'use client';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schemas/signUpSchema';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/apiResponse';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, LoaderPinwheel } from 'lucide-react';
import { signInSchema } from '@/schemas/signInSchema';
import { signIn } from 'next-auth/react';
import dbConnect from '@/lib/dbConnect';

const SignInPage = () => {
  console.log('Here...111');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const router = useRouter();

  // Zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      console.log('Result(Sign-in): ', result);

      if (result?.error) {
        toast({
          title: 'Signin failed!',
          description: 'Incorrect username or password',
          variant: 'destructive',
        });
      }
      if (result?.url) {
        toast({
          title: 'Success!',
          description: 'Signed In Successfully!',
        });
        router.replace('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Signin failed!',
        description: 'Failed while signing you in!',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='flex justify-center items-center min-h-screen bg-gray-800'>
        <div className='w-full max-w-md p-8 space-y-8 bg-white text-black rounded-lg shadow-md'>
          <div className='text-center'>
            <h1 className='text-4xl font-extrabold tracking-tight lg:text-3xl mb-6'>
              Join True Feedback
            </h1>
            <p className='mb-4 font-semibold'>
              Sign in to carry on with your anonymous adventure
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                name='identifier'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=' font-bold'>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='Email' type='text' {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=' font-bold'>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Password'
                        type='password'
                        {...field}
                      />
                    </FormControl>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                className='bg-black text-white font-semibold hover:text-black hover:border-black hover:border-2'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please
                    Wait!
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
          <div className='text-center mt-4'>
            <p>
              Already a member?{' '}
              <Link
                href='/signup'
                className='text-blue-600 hover:text-blue-800'
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
