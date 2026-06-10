import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { Layout } from "../components/Layout";
import { LegalContent } from "./TermsPage";

const FALLBACK_CONTENT = `
PRIVACY POLICY

Last updated: May 2026

1. INFORMATION WE COLLECT
We collect information you provide directly to us when using this platform, including name, email address, phone number, and any other information you choose to provide. We may also collect usage data and technical information about how you interact with the platform.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to provide, maintain, and improve our services, process transactions, send technical notices, respond to your comments, and monitor usage patterns.

3. DATA STORAGE AND PROTECTION
Your data is stored securely on the Internet Computer blockchain infrastructure. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

4. DATA SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to provide our services.

5. COOKIES AND TRACKING
We may use cookies and similar tracking technologies to enhance your experience on the platform. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

6. YOUR RIGHTS
You have the right to access the personal information we hold about you, request correction of inaccurate data, request deletion of your data where legally permissible, and withdraw consent where processing is based on consent.

7. THIRD-PARTY LINKS
Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.

8. CHILDREN'S PRIVACY
Our platform is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.

9. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.

10. CONTACT
For privacy-related inquiries, please contact us through the provided contact channels on this platform.
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

export function PrivacyPage() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery({
    queryKey: ["legal", "privacy"],
    queryFn: async () => {
      if (!actor) return null;
      return fetchLegalContent(
        actor as unknown as Record<string, unknown>,
        "privacy",
      );
    },
    enabled: !!actor && !isFetching,
  });

  const title = data?.title ?? "Privacy Policy";
  const content = data?.content ?? FALLBACK_CONTENT;

  return (
    <Layout>
      <div
        className="min-h-screen bg-background py-16 px-4"
        data-ocid="privacy.page"
      >
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
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
