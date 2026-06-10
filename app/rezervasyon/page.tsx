import { getSeo } from '@/lib/content';
import SectionHeader from '@/components/site/SectionHeader';
import ReservationForm from '@/components/site/ReservationForm';
import type { Metadata } from 'next';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/rezervasyon'); }

export default function ReservationPage() {
  return (
    <div className="container-site pt-32 max-w-2xl">
      <SectionHeader eyebrow="Masa Ayırtın" title="Rezervasyon" sub="Formu doldurun, en kısa sürede telefonla onaylayalım." />
      <ReservationForm />
    </div>
  );
}
