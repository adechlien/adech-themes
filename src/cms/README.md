# Adechen

The CMS entry point is `/admin` (planned production URL:
`https://design.adechlien.com/admin`). The public landing is independent.

- `components/CmsShell.jsx`: reusable layout accepting area configuration,
  navigation, controls, footer, and module content.
- `components/CmsAccessCard.jsx`: access layout independent of authentication.
- `components/Fields.jsx`: shared form controls using Adech semantic colors.
- `modules/themes/BranchEditor.jsx`: Themes-specific branch/palette/token editor.
- `modules/themes/BranchLibrary.jsx`: searchable publication cards and draft filters.
- `pages/Admin.jsx`: current authentication and data coordination.

The structure follows the configurable navigation and separate access view of
the CMS in `adechlien/blog`. Its authentication has not been migrated here.

Local development uses the existing Node API and SQLite database. Start with
`npm run dev`; the development token is `adech-local-admin` unless overridden
by `ADECH_ADMIN_TOKEN`. The browser still stores that token locally.
The access form now uses username `adechlien` (override with
`ADECH_ADMIN_USERNAME`) and that development token as its password.
The persistent shell animates access/sidebar/compact states with a 160 ms fade
out, 280 ms size change, then 160 ms fade in, respecting reduced motion.

Production is pending: deploy a compatible API and persistent database, replace
the development token login with server-managed sessions, and integrate the
existing `adechen/` data deliberately. A Vercel frontend rewrite alone does not
provide those services. No package is published yet; the reusable components
remain local until their API and authentication are finalized.
