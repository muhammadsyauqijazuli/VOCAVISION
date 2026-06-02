# TODO - PDF/Excel Download Improvements

- [ ] Update frontend download links
  - File: `src/app/(with-layout)/guru/reports/[id]/page.tsx`
  - Change: add `download` attribute to both PDF and Excel `<a>` tags
  - Keep: existing `href` logic via `downloadHref(...)` and Tailwind/CSS classes

- [ ] Update backend export responses
  - File: `backend/app/routes/export.py`
  - Change:
    - For `export_pdf()` set `Content-Length` using the generated PDF bytes
    - For `export_excel()` set `Content-Length` using the generated Excel bytes
  - Also avoid repeated `buffer.getvalue()` calls by storing bytes once
