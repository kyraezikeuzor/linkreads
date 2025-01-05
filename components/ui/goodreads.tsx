import {GoodreadsBook} from '@/types'

const goodreadsLogo = 'https://d.gr-assets.com/misc/1454549160-1454549160_goodreads_misc.png'

export function GoodreadsBooks(books:GoodreadsBook[]) {
    return (
        <div>
            {books && books.map((book,index)=>(
                <div key={index} className='grid grid-cols-[1fr_2fr]'>
                    <div>
                        <img className='w-6 h-8' src='https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1571423190i/41057294.jpg'/>
                    </div>
                    <div className='flex flex-col items-center justify-start'>
                        <span>{book.title}</span>
                        <span className='flex flex-row items-center'>
                            <img src={goodreadsLogo} className='w-3 h-3'/>
                            <span>Rating: {book.avgRating}</span>
                        </span>
                        <span>Date Read: {book.dateRead}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}