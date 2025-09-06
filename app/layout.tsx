export const metadata = {
  title: "OpenPipe Chat",
  description: "Simple chat UI using an OpenPipe model",
};

import "../styles/globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>OpenPipe Chat</h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

