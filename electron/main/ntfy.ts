import fetch from 'node-fetch';

export async function sendNtfy(title: string, message: string) {
  await fetch('https://ntfy.sh/ton_canal', {
    method: 'POST',
    headers: { 'Title': title },
    body: message,
  });
}