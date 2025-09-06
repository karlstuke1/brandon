export const metadata = {
  title: "Brandon & Leo Chat",
  description: "WhatsApp conversation between Brandon and Leo",
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
            <h1>WhatsApp - Brandon</h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

