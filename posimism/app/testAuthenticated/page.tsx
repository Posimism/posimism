"use client";
import { useDataClient } from "@/components/ConfigureAmplify";
import { Authenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { fetchUserAttributes, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";

export default function Home() {
  const dataClient = useDataClient();
  const [hasSub, setHasSub] = useState<boolean | null>(null);
  const [endpointSucceeded, setEndpointSucceeded] = useState<boolean | null>(
    null
  );

  console.log({endpointSucceeded});
  

  useEffect(() => {
    // fetchUserAttributes().then((attributes) => {
    //   setHasSub("sub" in attributes);
    //   console.log({ userAttributes: attributes });
    //   dataClient?.mutations
    //     .testIsAuthenticated({}, { authMode: "identityPool" })
    //     .then(() => {
    //       setEndpointSucceeded(true);
    //     })
    //     .catch(() => {
    //       setEndpointSucceeded(false);
    //     });
    // });
    if (dataClient === null) return;
    dataClient.mutations
      .testIsAuthenticated({}, { authMode: "userPool" })
      .then((data) => {
        console.log(data);
        setEndpointSucceeded(!data.errors);
      })
      .catch(() => {
        setEndpointSucceeded(false);
      });
  }, [dataClient]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-tr from-purple-300 via-blue-200 to-green-300 overflow-hidden">
      <Authenticator>
        {hasSub !== null && <p>{hasSub ? "hasSub" : "noSub"}</p>}
        {endpointSucceeded !== null && (
          <p>{endpointSucceeded ? "endpoint200" : "endpointNOT200"}</p>
        )}
        <button className="bg-red-500" onClick={() => signOut()}>
          Sign Out
        </button>
      </Authenticator>
    </div>
  );
}
