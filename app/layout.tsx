import './globals.css';

export const metadata = {
  title: 'SolveOS',
  description: 'AI for hard life decisions',
}

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
   <html lang="en">
      <body>
         {children}
      </body>
   </html>
 )
}
