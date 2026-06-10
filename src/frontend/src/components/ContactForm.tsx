import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createActor } from "../backend";
import { useDebounce } from "../hooks/useThrottle";

// Strip HTML tags and limit length
function sanitizeInput(value: string, maxLen = 2000): string {
  return value
    .replace(/<[^>]*>/g, "")
    .slice(0, maxLen)
    .trim();
}

type FormStatus = "idle" | "submitting" | "success" | "rate_limited" | "error";

export function ContactForm() {
  const { actor } = useActor(createActor);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [msgError, setMsgError] = useState("");
  const submitCountRef = useRef(0);
  const windowStartRef = useRef(Date.now());

  const validateName = useCallback(() => {
    if (!name.trim()) {
      setNameError("Please enter your name.");
      return false;
    }
    setNameError("");
    return true;
  }, [name]);

  const validateMsg = useCallback(() => {
    if (!message.trim()) {
      setMsgError("Please enter a message.");
      return false;
    }
    setMsgError("");
    return true;
  }, [message]);

  const doSubmit = useCallback(async () => {
    const nameOk = validateName();
    const msgOk = validateMsg();
    if (!nameOk || !msgOk) return;

    // Client-side rate limiting: max 3 per 60s
    const now = Date.now();
    if (now - windowStartRef.current > 60_000) {
      windowStartRef.current = now;
      submitCountRef.current = 0;
    }
    if (submitCountRef.current >= 3) {
      setStatus("rate_limited");
      return;
    }
    submitCountRef.current += 1;

    setStatus("submitting");
    setErrorMsg("");

    try {
      if (!actor) throw new Error("Not connected");
      const result = await actor.submitContactMessage(
        sanitizeInput(name, 100),
        sanitizeInput(message, 2000),
        honeypot,
      );
      if (result.__kind__ === "ok") {
        setStatus("success");
        setName("");
        setMessage("");
      } else {
        const err = result.err.toLowerCase();
        if (
          err.includes("rate") ||
          err.includes("limit") ||
          err.includes("too many")
        ) {
          setStatus("rate_limited");
        } else {
          setStatus("error");
          setErrorMsg(result.err);
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }, [actor, name, message, honeypot, validateName, validateMsg]);

  const debouncedSubmit = useDebounce(doSubmit, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSubmit();
  };

  if (status === "success") {
    return (
      <div
        data-ocid="contact.form.success_state"
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-primary" strokeWidth={1.5} />
        <h3 className="heading-md text-foreground">Message Received</h3>
        <p className="body-base text-muted-foreground max-w-xs">
          Thank you for reaching out. I will get back to you soon.
        </p>
        <Button
          variant="outline"
          onClick={() => setStatus("idle")}
          data-ocid="contact.form.send_another_button"
          className="mt-2 border-primary/40 hover:bg-primary/10 hover:text-foreground transition-smooth"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
      data-ocid="contact.form"
    >
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="contact-name"
          className="text-foreground/80 text-sm font-body"
        >
          Your Name <span className="text-primary">*</span>
        </Label>
        <Input
          id="contact-name"
          data-ocid="contact.name_input"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={validateName}
          maxLength={100}
          disabled={status === "submitting"}
          className="bg-secondary border-border focus:border-primary/60 transition-smooth text-foreground placeholder:text-muted-foreground"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "name-error" : undefined}
        />
        {nameError && (
          <p
            id="name-error"
            data-ocid="contact.name.field_error"
            className="text-xs text-destructive mt-0.5"
          >
            {nameError}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="contact-message"
          className="text-foreground/80 text-sm font-body"
        >
          Your Message <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="contact-message"
          data-ocid="contact.message_textarea"
          placeholder="Tell me how I can help you..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={validateMsg}
          maxLength={2000}
          rows={5}
          disabled={status === "submitting"}
          className="bg-secondary border-border focus:border-primary/60 transition-smooth text-foreground placeholder:text-muted-foreground resize-none"
          aria-invalid={!!msgError}
          aria-describedby={msgError ? "msg-error" : undefined}
        />
        {msgError && (
          <p
            id="msg-error"
            data-ocid="contact.message.field_error"
            className="text-xs text-destructive mt-0.5"
          >
            {msgError}
          </p>
        )}
      </div>

      {/* Invisible honeypot — screen-reader / bot trap */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Rate limit / error feedback */}
      {status === "rate_limited" && (
        <div
          data-ocid="contact.form.rate_limit_error"
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Too many messages. Please wait a moment before trying again.
          </span>
        </div>
      )}
      {status === "error" && (
        <div
          data-ocid="contact.form.error_state"
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg || "Something went wrong. Please try again."}</span>
        </div>
      )}

      <Button
        type="submit"
        data-ocid="contact.form.submit_button"
        disabled={status === "submitting"}
        className="w-full bg-primary text-primary-foreground font-display font-semibold py-6 text-base hover:opacity-90 shadow-gold transition-smooth mt-1"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending…
          </>
        ) : (
          "Send a Message"
        )}
      </Button>
    </form>
  );
}
