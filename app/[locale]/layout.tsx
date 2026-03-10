import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata = {
  title: '78 On Jean - Luxury Hotel',
  description: 'Experience luxury hospitality in the heart of South Africa',
};


export default async function LocaleLayout(props: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { children, params } = props;
  const { locale } = await params;
  let messages;
  try {
    messages = (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    notFound();
  }
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
