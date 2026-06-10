import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { Layout } from "../components/Layout";
import { LegalContent } from "./TermsPage";

const FALLBACK_CONTENT = `
REFUND POLICY

Last updated: May 2026

1. OVERVIEW
This Refund Policy outlines the conditions under which refunds may be issued for services and products purchased through this platform. Please read this policy carefully before making a purchase.

2. DIGITAL PRODUCTS AND SERVICES
Due to the nature of digital products and custom services, all sales are generally final. Once a digital product has been delivered or a service has been commenced, refunds are not automatically issued.

3. ELIGIBLE REFUND SCENARIOS
Refunds may be considered in the following circumstances: the service was not delivered as described, a technical error resulted in duplicate billing, the project was cancelled before any work commenced, or there was a significant failure to meet agreed deliverables despite reasonable opportunity to remedy.

4. NON-REFUNDABLE ITEMS
The following are generally non-refundable: consulting sessions that have already taken place, custom builds where work has been initiated, training modules or courses that have been accessed, and any services where work has been completed or delivered.

5. REFUND REQUEST PROCESS
To request a refund, you must contact us within 7 days of the issue arising, provide your order reference and a clear explanation of the issue, and allow us a reasonable opportunity to resolve the issue before a refund is processed.

6. PROCESSING TIME
Approved refunds will be processed within 7 to 14 business days. The refund will be issued using the original payment method where possible.

7. PARTIAL REFUNDS
In cases where partial work has been completed, we reserve the right to issue a partial refund proportional to the work remaining or undelivered.

8. CHARGEBACKS
We strongly encourage you to contact us directly to resolve any disputes before initiating a chargeback. Unauthorized chargebacks may result in account suspension and potential recovery action.

9. CHANGES TO THIS POLICY
We reserve the right to modify this Refund Policy at any time. Changes take effect immediately upon posting.

10. CONTACT
For refund requests or questions, please contact us through the provided contact channels on this platform.
`.trim();

async function fetchLegalContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actor: Record<string, unknown>,
  id: string,
): Promise<{ title: string; content: string } | null> {
  const fn = actor.getLegalContent;
  if (typeof fn !== "function") return null;
  try {
    const result = await (fn as (id: string) => Promise<unknown>).call(
      actor,
      id,
    );
    if (
      result &&
      typeof result === "object" &&
      "__kind__" in (result as object) &&
      (result as { __kind__: string }).__kind__ === "Some" &&
      "value" in (result as object)
    ) {
      return (
        result as {
          __kind__: "Some";
          value: { title: string; content: string };
        }
      ).value;
    }
  } catch {
    // method not available yet
  }
  return null;
}

export function RefundPage() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery({
    queryKey: ["legal", "refund"],
    queryFn: async () => {
      if (!actor) return null;
      return fetchLegalContent(
        actor as unknown as Record<string, unknown>,
        "refund",
      );
    },
    enabled: !!actor && !isFetching,
  });

  const title = data?.title ?? "Refund Policy";
  const content = data?.content ?? FALLBACK_CONTENT;

  return (
    <Layout>
      <div
        className="min-h-screen bg-background py-16 px-4"
        data-ocid="refund.page"
      >
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <>
              <div className="mb-10">
                <p className="text-[10px] uppercase tracking-widest text-primary font-body font-semibold mb-2">
                  Legal
                </p>
                <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
                  {title}
                </h1>
                <div className="w-12 h-0.5 bg-primary rounded-full" />
              </div>
              <LegalContent content={content} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
