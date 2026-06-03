import Link from "next/link";

export default function NotAuthorized() {
  return (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <div className="rounded-2xl border border-stroke bg-white p-8 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <h1 className="mb-3 text-3xl font-bold text-dark dark:text-white">
          Not Authorized
        </h1>
        <p className="mb-6 text-dark-4 dark:text-dark-6">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
