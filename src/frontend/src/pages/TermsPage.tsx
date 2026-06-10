import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import { Layout } from "../components/Layout";

const FALLBACK_CONTENT = `
TERMS & CONDITIONS

Last updated: May 2026

1. ACCEPTANCE OF TERMS
By accessing or using this platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this platform.

2. USE OF PLATFORM
You may use this platform only for lawful purposes and in accordance with these Terms. You agree not to use the platform in any way that violates applicable local, national, or international law or regulation.

3. INTELLECTUAL PROPERTY
All content, features, and functionality on this platform — including but not limited to text, graphics, logos, and software — are the exclusive property of the platform owner and are protected by applicable intellectual property laws.

4. USER ACCOUNTS
You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.

5. LIMITATION OF LIABILITY
To the fullest extent permitted by law, the platform owner shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.

6. MODIFICATIONS
We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of the modified Terms.

7. GOVERNING LAW
These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law provisions.

8. CONTACT
For questions about these Terms, contact us through the provided contact channels on this platform.
`.trim();

type LegalLine = {
  key: string;
  text: string;
  isHeading: boolean;
  isEmpty: boolean;
};

function parseLegalContent(content: string): LegalLine[] {
  return content.split("\n").map((line, i) => {
    const trimmed = line.trim();
    const isHeading =
      /^\d+\.\s+[A-Z]/.test(trimmed) || /^[A-Z][A-Z\s&]+$/.test(trimmed);
    return {
      key: `line-${i}-${trimmed.slice(0, 20)}`,
      text: trimmed,
      isHeading,
      isEmpty: !trimmed,
    };
  });
}

export function LegalContent({ content }: { content: string }) {
  const lines = parseLegalContent(content);
  return (
    <div className="prose-legal">
      {lines.map((line) => {
        if (line.isEmpty) return <div key={line.key} className="h-3" />;
        if (line.isHeading) {
          return (
            <h2
              key={line.key}
              className="font-display font-bold text-lg mt-8 mb-2"
              style={{ color: "#B8960C" }}
            >
              {line.text}
            </h2>
          );
        }
        return (
          <p
            key={line.key}
            className="font-body text-sm text-muted-foreground leading-relaxed"
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}

// Safe call for optional backend method (added after bindgen)
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

export function TermsPage() {
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery({
    queryKey: ["legal", "terms"],
    queryFn: async () => {
      if (!actor) return null;
      return fetchLegalContent(
        actor as unknown as Record<string, unknown>,
        "terms",
      );
    },
    enabled: !!actor && !isFetching,
  });

  const title = data?.title ?? "Terms & Conditions";
  const content = data?.content ?? FALLBACK_CONTENT;

  return (
    <Layout>
      <div
        className="min-h-screen bg-background py-16 px-4"
        data-ocid="terms.page"
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
