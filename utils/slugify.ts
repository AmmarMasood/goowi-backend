import { v4 as uuidv4 } from 'uuid'; // Import the UUID library

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  const baseSlug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/@.*$/, '') // Remove everything after @ (for emails)
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -

  const uniqueId = uuidv4(); // Generate a UUID

  return `${baseSlug}-${uniqueId}`;
}
