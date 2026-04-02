import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EVENTS } from "@/constants";
import { EventDetailClient } from "./EventDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);
  if (!event) return {};
  return {
    title: `${event.artist} — AMOK`,
    description: `${event.subtitle} · ${event.date} · ${event.venue}`,
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);
  if (!event) notFound();
  return <EventDetailClient event={event} />;
}
