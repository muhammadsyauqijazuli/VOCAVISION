export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 animate-pulse rounded bg-gray-200 dark:bg-dark-3" />

      <section className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-dark-3" />
            <div className="h-8 w-80 max-w-full animate-pulse rounded bg-gray-200 dark:bg-dark-3" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-dark-3" />
          </div>

          <div className="h-24 w-full max-w-xs animate-pulse rounded-2xl bg-gray-200 dark:bg-dark-3" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 h-[420px] animate-pulse rounded-2xl bg-gray-200 dark:bg-dark-3" />
        <div className="h-[420px] animate-pulse rounded-2xl bg-gray-200 dark:bg-dark-3" />
      </section>
    </div>
  );
}