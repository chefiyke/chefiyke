import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { Layout } from "../components/Layout";
import { LegalContent } from "./TermsPage";

const FALLBACK_CONTENT = `
DISCLAIMER

Last updated: May 2026

1. GENERAL DISCLAIMER
The information provided on this platform is for general informational and educational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the platform.

2. NO PROFESSIONAL ADVICE
Nothing on this platform constitutes professional financial, legal, medical, business, or investment advice. The content shared is based on personal experience and perspective. Always consult qualified professionals before making important decisions.

3. NO GUARANTEE OF RESULTS
Any results, outcomes, or testimonials mentioned on this platform represent individual experiences. Results may vary significantly from person to person. Past performance does not guarantee future results. We make no claims that using our services or following our advice will produce specific outcomes.

4. BUSINESS AND FINANCIAL INFORMATION
Any business strategies, financial figures, income representations, or business examples shared on this platform are illustrative only. We cannot guarantee that you will earn any specific amount of money or achieve specific business results.

5. EXTERNAL LINKS AND THIRD-PARTY CONTENT
This platform may contain links to third-party websites or services. These links are provided for convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.

6. PLATFORM AVAILABILITY
We do not warrant that the platform will be uninterrupted, error-free, or free of viruses or other harmful components. We reserve the right to modify, suspend, or discontinue any part of the platform at any time without notice.

7. LIMITATION OF LIABILITY
Under no circumstances shall we be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform or its content.

8. CHANGES TO THIS DISCLAIMER
We reserve the right to update this Disclaimer at any time. Your continued use of the platform following any changes constitutes acceptance of those changes.
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

export function DisclaimerPage() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery({
    queryKey: ["legal", "disclaimer"],
    queryFn: async () => {
      if (!actor) return null;
      return fetchLegalContent(
        actor as unknown as Record<string, unknown>,
        "disclaimer",
      );
    },
    enabled: !!actor && !isFetching,
  });

  const title = data?.title ?? "Disclaimer";
  const content = data?.content ?? FALLBACK_CONTENT;

  return (
    <Layout>
      <div
        className="min-h-screen bg-background py-16 px-4"
        data-ocid="disclaimer.page"
      >
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
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
