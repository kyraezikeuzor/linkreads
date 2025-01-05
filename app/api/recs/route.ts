import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { GoodreadsBook } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios'


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Remove NEXT_PUBLIC_ prefix
});

export async function POST(request: NextRequest) {
  try {
    const data: GoodreadsBook[] = await request.json();
    
    const bookRecPrompt = `
      You are an expert and all-knowing book recommender. 
      You are intuitive and you give recommendations based on these factors:
      Genre of books listed, Date the user read the book (prefer relevancy), Average rating of the book (prefer higher ratings)
      You will be given an input in JSON array form. You MUST under ALL circumstances return your book recommendations in the following format:
      {
        "BookReference": string,
        "BookRecommendations": [
          {
            "title": string,
            "author": string
          }
        ]
      }
      Do not say hello. Do not respond with anything else except the JSON object.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: bookRecPrompt },
        { role: "user", content: JSON.stringify(data) }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content in OpenAI response');
    }

    const parsedResponse = JSON.parse(responseContent);
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error processing book recommendations:', error);
    
    // More specific error handling
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse OpenAI response' },
        { status: 500 }
      );
    }
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'OpenAI API error: ' + error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/*
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const BookRecommendations = z.object({
  BookReference: z.string(),
  BookRecommendations: z.array(
    z.object({
      title: z.string(),
      author: z.string(),
    })
  ).nonempty(),
});

export async function POST(request: NextRequest) {
  try {
    const data: GoodreadsBook[] = await request.json();
    //const { searchParams } = new URL(request.url);
    //const data = searchParams.get('body')

    const bookRecPrompt = `
      You are an expert and all-knowing book recommender. 
      You are intuitive and you give recommendations based on these factors:
      Genre of books listed, Date the user read the book (prefer relevancy), Average rating of the book (prefer higher ratings)
      You will be given an input in JSON array form. You MUST under ALL circumstances return your book recommendations in the authorized format. NO EXCEPTIONS.
      Do not say hello. Do you respond with anything else except the JSON array.
    `;

    /*const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {role: "system", content: "You are a helpful assistant."},
        { role: "system", content: bookRecPrompt },
        { role: "user", content:'The Great Gatsby' },
      ],
      //response_format: zodResponseFormat(BookRecommendations, "recommendations"),
    });

    const message = [
        {role: "system", content: "You are a helpful assistant."},
        { role: "system", content: bookRecPrompt },
        { role: "user", content:`${data}`},
      ]

    const config = {
        headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
        }
    }; 

    axios.post('https://api.openai.com/v1/chat/completions', {model: 'gpt-4', messages:message}, config)
        .then(response => {
            const responseJSON = JSON.parse(response.data.choices[0].message.content);
            console.log(response.data.choices[0].message.content);
            return NextResponse.json(responseJSON);
        })
        .catch(error => {
          console.log("Error making API call:", error.response || error.message);
        });

    ///return NextResponse.json(completion.choices[0].message.parsed);

  } catch (error) {
    console.error('Error processing book recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to process book recommendations' },
      { status: 500 }
    );
  }
}

*/