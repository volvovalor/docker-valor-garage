// CAR DETAIL (layout)

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getCar } from "@/db/queries";


// MAIN FUNCTION
export default async function CarLayout({
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
