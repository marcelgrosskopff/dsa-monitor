import { Page } from "@/components/blocks/Page";
import { Button } from "@/components/ds";

export default function NotFound() {
  return (
    <Page current="/">
      <div className="notfound">
        <p className="code">Error 404 · Page not found</p>
        <h1>We couldn&apos;t find that page.</h1>
        <p>
          The report or page you&apos;re looking for may have moved or been
          renamed. Every report is two clicks from the start: Home →
          Publications → report.
        </p>
        <div className="notfound__actions">
          <Button variant="primary" as="a" href="/">
            Back to home
          </Button>
          <Button variant="secondary" as="a" href="/publications">
            Browse publications
          </Button>
        </div>
      </div>
    </Page>
  );
}
