
import { useState } from "react";

import ThemedLayout from "@/components/layout/ThemedLayout";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";



const API_URL = import.meta.env.VITE_API_URL || "http://192.168.0.113:30080/api";



export default function AdminMediaPage() {

  const [password, setPassword] = useState("");

  const [unlocked, setUnlocked] = useState(false);

  const [error, setError] = useState("");



  const adminPassword = "NEW@socar7"; 



  const unlock = () => {

    if (password === adminPassword) {

      setUnlocked(true);

      setError("");

    } else {

      setError("Wrong admin password");

    }

  };



  return (

    <ThemedLayout>

      <section className="container relative z-10 mx-auto px-4 py-10">

        <div className="mx-auto max-w-5xl rounded-3xl border bg-card/90 p-6 shadow-lg backdrop-blur">

          <h1 className="mb-2 text-3xl font-bold">Master Admin Media Center</h1>

          <p className="mb-6 text-muted-foreground">

            Upload, view, assign, and delete NAS photos/videos.

          </p>



          {!unlocked ? (

            <div className="max-w-md rounded-2xl border bg-background p-5">

              <h2 className="mb-3 text-xl font-semibold">Admin password</h2>



              <Input

                type="password"

                placeholder="Enter admin password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                onKeyDown={(e) => {

                  if (e.key === "Enter") unlock();

                }}

              />



              {error && (

                <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">

                  {error}

                </p>

              )}



              <Button className="mt-4 w-full" onClick={unlock}>

                Unlock Admin Media

              </Button>

            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border bg-white">

              <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">

                <div>

                  <h2 className="font-semibold">NAS Media Admin</h2>

                  <p className="text-sm text-muted-foreground">

                    Connected to backend API admin page

                  </p>

                </div>



                <Button

                  variant="outline"

                  onClick={() => {

                    setUnlocked(false);

                    setPassword("");

                  }}

                >

                  Lock

                </Button>

              </div>



              <iframe

                title="NAS Media Admin"

                src={`${API_URL}/admin/media-db-page?key=${encodeURIComponent(adminPassword)}`}

                className="h-[900px] w-full border-0"

              />

            </div>

          )}

        </div>

      </section>

    </ThemedLayout>

  );

}

