"use client";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
// import { fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useEffect, useState } from "react";

// Amplify.configure(outputs, { ssr: true });
Amplify.configure(outputs);

export default function ConfigureAmplifyClientSide() {
  return null;
}

// components/ConfigureAmplify.tsx

// Helper to get the data client
export function useDataClient() {
  const [client, setClient] = useState<ReturnType<
    typeof generateClient<Schema>
  > | null>(null);

  useEffect(() => {
    const client = generateClient<Schema>();
    setClient(client);
  }, []);

  return client;
}
