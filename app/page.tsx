'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

import { 
  Control, 
  useForm, 
  useFieldArray, 
  useWatch
} from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast, { Toaster } from "react-hot-toast";
import type { GoodreadsBook } from '@/types'
import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { GoodreadsBooks } from '@/components/ui/goodreads'
import { goodreadsLogo } from '@/lib/data'
import { useAI } from '@/hooks/use-ai'

const formSchema = z.object({
  url: z.string().min(1, 'Profile url is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [goodreadsData, setGoodreadsData] = useState<GoodreadsBook[] | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: ''
    }
  });

  const { control, handleSubmit } = form;

  async function onSubmit(formData:FormValues) {
    if (!formData.url) {
      toast('📚 No Goodreads URL provided.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/goodreads?url=${encodeURIComponent(formData.url)}`);
      
      if (response.data) {
        setGoodreadsData(response.data);
        toast.success('Successfully linked to Goodreads');
        console.log(goodreadsData)

        try {
          const recs = await useAI(response.data)
          if (recs) {
            console.log(recs)
            toast.success('Successfully got recs');
          } else {
            toast.error('Coold not get recs');
          }
        } catch (error:any) {
          console.log(error.message)
        }
         
      }

    } catch (error: any) {
      console.error(`Error fetching the Goodreads url:`, error);
      toast.error(`${error.message} Failed to fetch book data`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className=" items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <h1>Linkreads</h1>

      <div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter your Goodreads profile</FormLabel>
                  <FormControl>
                    <Input
                      required
                      disabled={isLoading}
                      placeholder="https://www.goodreads.com/user/show/130048134-kyra-ezikeuzor"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Press me'}
            </Button>
          </form>
        </Form>
      </div>

      <div className="mt-8">
        <h2>What you Read</h2>
        {goodreadsData && goodreadsData.map((book,index)=>(
          <div key={index} className='w-full flex flex-row items-center bg-gray-100/75 p-2 justify-center gap-3 mb-3 rounded-lg'>
              <div className='w-10 h-fit bg-red-300'>
                  <img className='object-fit' src={book.cover}/>
              </div>
              <div className='w-2/3 flex flex-col justify-start text-xs'>
                  <span>{book.title}</span>
                  <span className='flex flex-row gap-1 items-center'>
                      <img src={goodreadsLogo} className='w-3 h-3'/>
                      <span>Rating: {book.avgRating}</span>
                  </span>
                  <span>Date Read: {book.dateRead}</span>
              </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2>AI Recommendations</h2>
        {/* Add recommendations component here */}
      </div>

      <Toaster />
    </div>
  );
}
