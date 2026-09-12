interface NoIndexProps {
  title?: string;
  follow?: boolean;
}

export function NoIndex({
  title = 'Altioria',
  follow = true,
}: NoIndexProps) {
  return (
    <>
      <title>{title}</title>

      <meta
        name="robots"
        content={
          follow
            ? 'noindex, follow'
            : 'noindex, nofollow'
        }
      />
    </>
  );
}