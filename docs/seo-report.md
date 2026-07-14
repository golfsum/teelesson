# SEO and public homepage report

Updated: 2026-07-13

## Search intent

Current result pages for `golf coach management software`, `golf lesson
scheduling software for coaches`, and `golf coaching app student progress
practice plans` separate into four clusters:

- High intent: golf lesson scheduling software, golf coach management software
- Problem aware: reduce golf coaching admin, stop booking back-and-forth
- Workflow: student progress tracking, practice plans, lesson reminders
- Alternative and comparison: generic booking software, video coaching apps

Current official result examples include SwingPath, Bookeo, OctopusPro,
SwingMatch, Golf Genius Coach360, CoachNow, Skillest, Onform, and Hole19 CORE.
The public-source review was completed on 2026-07-13.

## Page contract

Audience: independent golf coaches.  
Primary category: golf coach management software.  
Promise: run students, lessons, practice, progress, and payment status from one
focused workspace.  
Conversion: start a free account.  
Proof: code-native dashboard preview and a working public coach profile.

The revised hero uses the exact reference promise, `Run your coaching. Grow your
impact.`, and avoids unverified ratings, customer counts, awards, testimonials,
or processor claims.

## Technical implementation

- Runtime title and description through React Navigation and document metadata
- Canonical URL per public path
- Open Graph and Twitter large-card metadata with a reviewed 1200 by 630 image
- SoftwareApplication structured data in the production export
- Signed-in workspace `noindex,nofollow`
- Public route `index,follow,max-image-preview:large`
- `public/robots.txt`, `public/sitemap.xml`, and `public/site.webmanifest`
- App icons, favicon, and social card generated from first-party SVG sources
- Working landing CTAs to sign-up, sign-in, and public profile
- Responsive captures at 1536 by 1024 and 390 by 844

The static Expo single-page export is crawlable after JavaScript execution, but
it is not server-rendered HTML. Server rendering is the clearest next SEO
improvement before a major acquisition campaign. Search rank and traffic are
not guaranteed.
