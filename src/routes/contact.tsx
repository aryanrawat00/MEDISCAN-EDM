import { T, useI18n } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Github } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MediScan AI" },
      {
        name: "description",
        content: "Get in touch with the MediScan AI team. We'd love to hear feedback, ideas and questions.",
      },
      { property: "og:title", content: "Contact MediScan AI" },
      { property: "og:description", content: "Send us feedback, ideas, or questions." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Local-only acknowledgement; wire to your inbox/Resend later.
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    setName(""); setEmail(""); setMessage("");
    toast.success(t("Thanks! We'll get back to you soon."));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
         <T>{"Let's"}</T> <span className="brand-text-gradient"> <T>{"talk"}</T> </span>.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
         <T>{"Feedback, feature ideas, partnership questions — drop us a note."}</T> </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name"> <T>{"Name"}</T> </Label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="email"> <T>{"Email"}</T> </Label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="message"> <T>{"Message"}</T> </Label>
            <Textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 min-h-[180px]"
              placeholder={t("How can we help?")}
            />
          </div>
          <Button type="submit" disabled={sending} className="brand-gradient text-white">
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>

        <aside className="space-y-4">
          <Item icon={<Mail className="h-5 w-5" />} title={t("Email")}>
            hello@mediscan.ai
          </Item>
          <Item icon={<MessageSquare className="h-5 w-5" />} title={t("Support")}>
            support@mediscan.ai
          </Item>
          <Item icon={<Github className="h-5 w-5" />} title={t("Open source")}>
             <T>{"File an issue on GitHub"}</T> </Item>
        </aside>
      </div>
    </div>
  );
}

function Item({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-white">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}
