// NOT FOUND
// When a route does not exist

// IMPORTS
import Link from "next/link";
// import { Button } from "@/components/ui";


// MAIN FUNCTION
export default function NotFound() {
  return (
    <div className="py-20 text-center">

      <h1 className="text-2xl font-semibold">Not in the bay</h1>
      <p className="mt-2 text-sm text-muted">That page is not here.</p>
      <Link href="/" className="mt-4 inline-block">
        {/* <Button>Back to fleet</Button> */}
      </Link>

    </div>
  );
}
