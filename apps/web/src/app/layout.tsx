import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'PulseGym - Gym Management System',
    description: 'Run your gym from one control panel. Miss nothing.',
    keywords: ['gym', 'management', 'fitness', 'members', 'classes'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className="min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
