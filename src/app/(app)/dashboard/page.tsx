'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Message } from '@/models/user.model';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/apiResponse';
import { Button } from '@/components/ui/button';
import MessageCard from '@/components/MessageCard';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { User } from 'next-auth';

function page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  });

  // Research on this
  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-message');
      setValue('acceptMessages', response.data.isAcceptingMessage!);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ||
          'Failed to fetch message settings!',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(false)
    try {
      const response = await axios.get('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast({
          title: 'Messages refreshed',
          description: 'Showing latest messages!',
          style: {
            backgroundColor: 'white',
            color: 'black',
          },
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ||
          'Failed to fetch message settings!',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session.user) {
      return;
    }
    fetchMessages()
    fetchAcceptMessage()
  }, [session, setValue, fetchAcceptMessage, fetchMessages])

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      })
      setValue('acceptMessages', !acceptMessages)
      toast({
        title: response.data.message,
        variant: 'default',
        style: {
          backgroundColor: 'white',
          color: 'black',
        },
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ||
          'Failed to fetch message settings!',
        variant: 'destructive',
      });
    }
  }

  const { username } = session?.user as User;
  // TODO: Do more research
  const baseURL = `${window.location.protocol}//${window.location.host}`
  const profileURL = `${baseURL}/u/${username}/`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileURL);
    toast({
      title: 'Copied to clipboard!',
      variant: 'default',
      style: {
        backgroundColor: 'white',
        color: 'black',
      },
    });
  }
  
  if (!session || !session.user) {
    return <>Please login</>
  }
  
  return (
    <div className='my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl'>
      <h1 className='text-4xl font-bold mb-4'>User Dashboard</h1>

      <div className='mb-4'>
        <h2 className='text-lg font-semibold mb-2'>Copy Your Unique Link</h2>{' '}
        <div className='flex items-center'>
          <input
            type='text'
            value={profileURL}
            disabled
            className='input input-bordered w-full p-2 mr-2'
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className='mb-4'>
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className='ml-2'>
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        variant='outline'
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
        className='mt-4 bg-black text-white font-semibold hover:text-black hover:border-black hover:border-2'
      >
        {isLoading ? (
          <Loader2 className='h-4 w-4 animate-spin' />
        ) : (
          <RefreshCcw className='h-4 w-4' />
        )}
      </Button>
      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {messages.length > 0 ? (
          messages.map((message: Message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default page;
