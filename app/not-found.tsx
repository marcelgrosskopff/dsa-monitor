import { Page } from "@/components/blocks/Page";
import { Button } from "@/components/ds";
import { getNotFoundContent } from "@/lib/content";

export default async function NotFound() {
  const notFound = await getNotFoundContent();
  return (
    <Page current="/">
      <div className="notfound">
        <p className="code">{notFound.errorCode || "Error 404 · Page not found"}</p>
        <h1>{notFound.heading || "We couldn’t find that page."}</h1>
        <p>
          {notFound.body ||
            "The report or page you’re looking for may have moved or been renamed. Every report is two clicks from the start: Home → Publications → report."}
        </p>
        <div className="notfound__actions">
          <Button variant="primary" as="a" href="/">
            {notFound.homeLabel || "Back to home"}
          </Button>
          <Button variant="secondary" as="a" href="/publications">
            {notFound.publicationsLabel || "Browse publications"}
          </Button>
        </div>
      </div>
    </Page>
  );
}
