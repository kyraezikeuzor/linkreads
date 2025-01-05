import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractProfileString(url:string):string {
  /*const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  return pathSegments[pathSegments.length - 1] ?? '';*/
  const userId = url.split('/').pop() ?? '';
  return userId.match(/^\d+/)?.[0] ?? '';  // Gets only the numbers from the start
}
