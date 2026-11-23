export function FuelChart({ title, months, values, format, tone = "accent" }: {
  title: string;
  months: string[];
  values: (number | null)[];
  format: (value: number) => string;
  tone?: "accent" | "teal" | "sky";
}) {
  const max = Math.max(0, ...values.map((value) => value ?? 0));
  const color = { accent: "fill-accent", teal: "fill-teal-500", sky: "fill-sky-500" }[tone];
  const gap = 480 / months.length;
  const monthsFormat = new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" });
  const monthLabel = (month: string) => monthsFormat.format(new Date(`${month}-01T00:00:00Z`));

  return (
    <figure className="min-w-0 border-t border-border pt-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-semibold">
        {title}
        {max > 0 && <span className="text-xs font-normal text-muted">Peak {format(max)}</span>}
      </figcaption>
      {max === 0 ? (
        <p className="flex h-24 items-center text-sm text-muted">{values.some((value) => value !== null) ? "No activity in this period." : "Not enough data in this period."}</p>
      ) : <>
        <svg viewBox="0 0 480 108" role="img" aria-label={`${title} by month`} className="mt-3 h-24 w-full" preserveAspectRatio="none">
          {[10, 52, 94].map((line) => <line key={line} x1="0" x2="480" y1={line} y2={line} className="stroke-border" vectorEffect="non-scaling-stroke" />)}
          {values.map((value, index) => {
            if (value === null || value <= 0) return null;
            const height = Math.max(1.5, value / max * 84);
            return <rect key={months[index]} x={index * gap + gap * 0.15} y={94 - height} width={gap * 0.7} height={height} rx="2" className={color}>
              <title>{monthLabel(months[index])}: {format(value)}</title>
            </rect>;
          })}
        </svg>
        <div className="flex justify-between text-xs text-muted" aria-hidden="true"><span>{monthLabel(months[0])}</span><span>{monthLabel(months[months.length - 1])}</span></div>
      </>}
      <details className="mt-2 text-xs text-muted">
        <summary className="w-fit cursor-pointer hover:text-foreground">Monthly values</summary>
        <dl className="mt-2 grid grid-cols-2 gap-1">
          {months.map((month, index) => <div key={month} className="flex justify-between gap-2 border-b border-border/60 px-1 py-1"><dt>{monthLabel(month)}</dt><dd className="text-foreground">{values[index] === null ? "No data" : format(values[index])}</dd></div>)}
        </dl>
      </details>
    </figure>
  );
}

