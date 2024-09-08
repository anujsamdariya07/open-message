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

const page = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 300);

  const { toast } = useToast();

  const router = useRouter();

  // Zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );
          console.log('Response: ', response);
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking failed'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    console.log(data);

    try {
      const response = await axios.post<ApiResponse>('/api/signup', data);

      if (!response) {
        toast({
          title: 'Error',
          description: 'Failed to sign up',
        });
      } else {
        toast({
          title: 'Success',
          description: response.data.message,
        });

        router.replace(`/verify/${username}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error in signup of user!');
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: 'Error',
        description: errorMessage ?? 'Failed to sign up',
        variant: 'destructive',
      });
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
            <p className='mb-4'>Sign up to start your anonymous adventure</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                name='username'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel  className=' font-bold'>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Username'
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          debounced(event.target.value);
                        }}
                      />
                    </FormControl>
                      {isCheckingUsername && <Loader2 className='animate-s'/>}
                      <p className={`text-sm ${usernameMessage === 'Username is availible!'? 'text-green-500': 'text-red-500'}`}>
                        {usernameMessage}
                      </p>
                    {/* <FormDescription>
                      This is your public display name.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='email'
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
              <Button type='submit' className='bg-black text-white font-semibold' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
                    Please Wait!
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>
          <div className='text-center mt-4'>
            <p>
              Already a member?{' '}
              <Link
                href='/sign-in'
                className='text-blue-600 hover:text-blue-800'
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
