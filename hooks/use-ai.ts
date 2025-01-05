'use client'
import {useState} from 'react'
import { GoodreadsBook } from '@/types'
import axios from 'axios'

export async function useAI(books: GoodreadsBook[]) {
  
    try {
        const response = await axios.post(`api/recs`, books);

        //if (!response.ok) {
        //throw new Error('Failed to get recommendations');
        //}

        //const data = await response.json();
        return response.data;
    } catch (err) {
        
        throw err;
    } finally {
        
    }
      
}
