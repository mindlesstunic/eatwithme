type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;

  return (
    <main>
      <h1>{slug}</h1>
      <p>Place details and recommendations</p>
    </main>
  );
}
