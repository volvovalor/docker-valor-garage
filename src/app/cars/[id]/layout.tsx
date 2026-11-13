// CAR DETAIL (layout)

import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { getCar } from "@/db/queries";


// MAIN FUNCTION
export default function CarLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" role="status">Loading vehicle...</div>}>
      <CarLayoutContent params={params}>{children}</CarLayoutContent>
    </Suspense>
  );
}


// CAR LAYOUT CONTENT
// Resolves the vehicle before rendering its detail routes.
async function CarLayoutContent({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();
  return children;
}
