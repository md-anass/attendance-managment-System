import { supabase } from "@/lib/supabase";

export default async function Home() {

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .limit(5);

  return (
    <main>
      <h1>
        Attendance Management System
      </h1>

      <pre>
        {JSON.stringify(
          {data, error},
          null,
          2
        )}
      </pre>

    </main>
  );
}


